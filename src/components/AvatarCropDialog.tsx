import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Crop as CropIcon, Sparkles, RotateCcw } from 'lucide-react';

interface AvatarCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageFile: File | null;
  onComplete: (file: File) => void;
}

// Hand-picked pixel art palettes from Lospec (proven to look great for portraits)
const PALETTES: Record<string, number[][]> = {
  retro: [ // Sweetie-16 extended - great for portraits
    [26,28,44],[93,39,93],[177,62,83],[239,125,87],[255,205,117],[167,240,112],
    [56,183,100],[37,113,121],[41,54,111],[59,93,201],[65,166,246],[115,239,247],
    [244,244,244],[148,176,194],[86,108,134],[51,60,87],
    [255,180,150],[230,150,120],[200,120,90],[170,95,70],[140,70,50],[100,50,35],
    [255,220,180],[240,200,160],[220,180,140],[200,160,120],[60,40,30],[35,25,20],
  ],
  pixel: [ // Endesga-32 - the gold standard for pixel art
    [190,74,47],[215,118,67],[234,212,170],[228,166,114],[184,111,80],[115,62,57],
    [62,39,49],[162,38,51],[228,59,68],[247,118,34],[254,174,52],[254,231,97],
    [99,199,77],[62,137,72],[38,92,66],[25,60,62],[18,78,137],[0,153,219],
    [44,232,245],[192,203,220],[139,155,180],[90,105,136],[58,68,102],[38,43,68],
    [24,20,37],[255,0,68],[104,56,108],[181,80,136],[246,117,122],[232,183,150],
    [194,133,105],[145,93,80],
  ],
  arcade: [ // PICO-8 - classic arcade 16-color palette
    [0,0,0],[29,43,83],[126,37,83],[0,135,81],[171,82,54],[95,87,79],
    [194,195,199],[255,241,232],[255,0,77],[255,163,0],[255,236,39],[0,228,54],
    [41,173,255],[131,118,156],[255,119,168],[255,204,170],
  ],
  minecraft: [ // Minecraft-inspired earthy tones
    [54,40,30],[85,63,47],[120,90,60],[160,130,90],[200,175,130],[230,215,180],
    [60,80,50],[80,120,60],[100,160,80],[40,60,40],[30,30,30],[70,70,70],
    [120,120,120],[180,180,180],[230,230,230],[255,255,255],
    [180,100,60],[140,70,40],[100,45,25],[200,140,100],[150,60,60],[80,40,40],
  ],
};

interface ArtStyle {
  id: string; label: string; emoji: string;
  gridSize: number; paletteId: string;
}

const ART_STYLES: ArtStyle[] = [
  { id: 'retro',     label: 'Retro',     emoji: '🕹️', gridSize: 64, paletteId: 'retro' },
  { id: 'pixel',     label: 'Pixel Art', emoji: '🎮', gridSize: 48, paletteId: 'pixel' },
  { id: 'arcade',    label: 'Arcade',    emoji: '👾', gridSize: 36, paletteId: 'arcade' },
  { id: 'minecraft', label: 'Minecraft', emoji: '⛏️', gridSize: 28, paletteId: 'minecraft' },
];

// Find nearest palette color using weighted perceptual distance
function nearest(r: number, g: number, b: number, pal: number[][]): number[] {
  let best = pal[0], bd = Infinity;
  for (const c of pal) {
    // Weighted RGB distance (approximates human perception)
    const rmean = (r + c[0]) / 2;
    const dr = r - c[0], dg = g - c[1], db = b - c[2];
    const d = (2 + rmean / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rmean) / 256) * db * db;
    if (d < bd) { bd = d; best = c; }
  }
  return best;
}

// Ordered (Bayer) dithering matrix 4x4
const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

function applyPixelArt(src: HTMLCanvasElement, style: ArtStyle): HTMLCanvasElement {
  const S = src.width;
  const G = style.gridSize;
  const pal = PALETTES[style.paletteId];

  // 1. Smooth downscale
  const small = document.createElement('canvas');
  small.width = small.height = G;
  const sc = small.getContext('2d')!;
  sc.imageSmoothingEnabled = true;
  sc.imageSmoothingQuality = 'high';
  sc.drawImage(src, 0, 0, G, G);

  // 2. Map to palette with ordered dithering
  const imgData = sc.getImageData(0, 0, G, G);
  const d = imgData.data;
  const ditherStrength = 24; // subtle dithering

  for (let y = 0; y < G; y++) {
    for (let x = 0; x < G; x++) {
      const i = (y * G + x) * 4;
      // Apply Bayer dithering offset
      const bayerVal = (BAYER4[y % 4][x % 4] / 16 - 0.5) * ditherStrength;
      const r = Math.max(0, Math.min(255, d[i] + bayerVal));
      const g = Math.max(0, Math.min(255, d[i + 1] + bayerVal));
      const b = Math.max(0, Math.min(255, d[i + 2] + bayerVal));

      const [nr, ng, nb] = nearest(r, g, b, pal);
      d[i] = nr; d[i + 1] = ng; d[i + 2] = nb;
    }
  }
  sc.putImageData(imgData, 0, 0);

  // 3. Crisp upscale
  const out = document.createElement('canvas');
  out.width = out.height = S;
  const oc = out.getContext('2d')!;
  oc.imageSmoothingEnabled = false;
  oc.drawImage(small, 0, 0, S, S);

  return out;
}

// Crop helpers
function centerAspectCrop(mw: number, mh: number) {
  return centerCrop(makeAspectCrop({ unit: '%', width: 80 }, 1, mw, mh), mw, mh);
}

function getCroppedCanvas(img: HTMLImageElement, crop: Crop, size = 256): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const sx = img.naturalWidth / img.width;
  const sy = img.naturalHeight / img.height;
  const side = Math.min(crop.width * sx, crop.height * sy);
  ctx.drawImage(img, crop.x * sx, crop.y * sy, side, side, 0, 0, size, size);
  return c;
}

export const AvatarCropDialog = ({ open, onOpenChange, imageFile, onComplete }: AvatarCropDialogProps) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [imgSrc, setImgSrc] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('pixel');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!imageFile) { setImgSrc(''); setPreviewUrl(null); return; }
    const r = new FileReader();
    r.onload = () => { setImgSrc(r.result as string); setPreviewUrl(null); setSelectedStyle('pixel'); };
    r.readAsDataURL(imageFile);
  }, [imageFile]);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    setCrop(centerAspectCrop(e.currentTarget.width, e.currentTarget.height));
  }, []);

  const style = ART_STYLES.find(s => s.id === selectedStyle) || ART_STYLES[1];

  const genPreview = useCallback(() => {
    if (!imgRef.current || !completedCrop?.width || !completedCrop?.height) return;
    const cropped = getCroppedCanvas(imgRef.current, completedCrop, 256);
    setPreviewUrl(applyPixelArt(cropped, style).toDataURL('image/png'));
  }, [completedCrop, style]);

  useEffect(() => {
    if (completedCrop?.width && completedCrop?.height) {
      clearTimeout(timer.current);
      timer.current = setTimeout(genPreview, 80);
    }
    return () => clearTimeout(timer.current);
  }, [completedCrop, selectedStyle, genPreview]);

  const handleSave = () => {
    if (!imgRef.current || !completedCrop?.width || !completedCrop?.height) return;
    setSaving(true);
    const cropped = getCroppedCanvas(imgRef.current, completedCrop, 256);
    applyPixelArt(cropped, style).toBlob((blob) => {
      if (!blob) { setSaving(false); return; }
      onComplete(new File([blob], 'avatar.png', { type: 'image/png' }));
      setSaving(false); onOpenChange(false);
    }, 'image/png', 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg minecraft-block bg-card border-4 border-border max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-black arcade-text text-primary flex items-center gap-2">
            <CropIcon className="h-5 w-5" /> CRAFT YOUR AVATAR
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {imgSrc && (
            <div className="rounded border-2 border-border overflow-hidden bg-black/20 flex items-center justify-center">
              <ReactCrop crop={crop} onChange={setCrop} onComplete={setCompletedCrop} aspect={1}>
                <img ref={imgRef} src={imgSrc} alt="Upload" onLoad={onImageLoad}
                  style={{ maxHeight: '260px', maxWidth: '100%', display: 'block' }} />
              </ReactCrop>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-black uppercase tracking-wider">Pixel Art Style</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {ART_STYLES.map((s) => (
                <button key={s.id} onClick={() => setSelectedStyle(s.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded border-2 transition-all duration-200 ${
                    selectedStyle === s.id
                      ? 'border-primary bg-primary/15 scale-[1.03] shadow-md shadow-primary/20'
                      : 'border-border/50 bg-muted/20 hover:border-primary/40'
                  }`}>
                  <span className="text-lg leading-none">{s.emoji}</span>
                  <span className={`text-[8px] font-black uppercase tracking-wider leading-tight ${
                    selectedStyle === s.id ? 'text-primary' : 'text-muted-foreground'
                  }`}>{s.label}</span>
                </button>
              ))}
            </div>
            {/* Palette preview */}
            <div className="flex gap-[2px] justify-center flex-wrap mt-1">
              {PALETTES[style.paletteId].slice(0, 16).map((c, i) => (
                <div key={i} className="w-3 h-3 rounded-sm border border-white/10"
                  style={{ backgroundColor: `rgb(${c[0]},${c[1]},${c[2]})` }} />
              ))}
            </div>
          </div>

          {previewUrl && (
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground text-center">Preview</p>
              <div className="flex justify-center gap-4 items-end">
                <div className="text-center space-y-1">
                  <img src={previewUrl} alt="Preview"
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-lg border-4 border-primary/30 bg-black"
                    style={{ imageRendering: 'pixelated' }} />
                  <p className="text-[9px] text-muted-foreground font-bold">Profile</p>
                </div>
                <div className="text-center space-y-1">
                  <img src={previewUrl} alt="Small"
                    className="w-10 h-10 rounded-full border-2 border-border bg-black"
                    style={{ imageRendering: 'pixelated' }} />
                  <p className="text-[9px] text-muted-foreground font-bold">Chat</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="font-black arcade-text text-xs border-2 h-10"
              onClick={() => { setSelectedStyle('pixel'); if (imgRef.current) setCrop(centerAspectCrop(imgRef.current.width, imgRef.current.height)); setPreviewUrl(null); }}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> RESET
            </Button>
            <Button size="sm" className="flex-1 font-black arcade-text text-xs border-2 h-10"
              onClick={handleSave} disabled={saving || !completedCrop?.width}>
              {saving ? <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> CRAFTING...</>
                : <><Sparkles className="h-3.5 w-3.5 mr-1" /> SAVE AVATAR</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
