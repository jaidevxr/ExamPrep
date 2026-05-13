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

interface ArtStyle {
  id: string; label: string; emoji: string;
  gridSize: number; colors: number;
}

const ART_STYLES: ArtStyle[] = [
  { id: 'retro',     label: 'Retro',     emoji: '🕹️', gridSize: 80, colors: 64 },
  { id: 'pixel',     label: 'Pixel Art', emoji: '🎮', gridSize: 64, colors: 48 },
  { id: 'arcade',    label: 'Arcade',    emoji: '👾', gridSize: 48, colors: 32 },
  { id: 'minecraft', label: 'Minecraft', emoji: '⛏️', gridSize: 32, colors: 24 },
];

// Simple median-cut palette builder
function medianCut(px: number[][], depth: number): number[][] {
  if (depth === 0 || px.length === 0) {
    const a = [0, 0, 0];
    for (const p of px) { a[0] += p[0]; a[1] += p[1]; a[2] += p[2]; }
    const n = px.length || 1;
    return [[Math.round(a[0] / n), Math.round(a[1] / n), Math.round(a[2] / n)]];
  }
  let mr = 0, ch = 0;
  for (let c = 0; c < 3; c++) {
    let lo = 255, hi = 0;
    for (const p of px) { if (p[c] < lo) lo = p[c]; if (p[c] > hi) hi = p[c]; }
    if (hi - lo > mr) { mr = hi - lo; ch = c; }
  }
  px.sort((a, b) => a[ch] - b[ch]);
  const m = px.length >> 1;
  return [...medianCut(px.slice(0, m), depth - 1), ...medianCut(px.slice(m), depth - 1)];
}

function nearest(r: number, g: number, b: number, pal: number[][]): number[] {
  let best = pal[0], bd = Infinity;
  for (const c of pal) {
    const d = 2 * (r - c[0]) ** 2 + 4 * (g - c[1]) ** 2 + 3 * (b - c[2]) ** 2;
    if (d < bd) { bd = d; best = c; }
  }
  return best;
}

// Clean pixel art: downscale smoothly → reduce colors → upscale crisp
function applyPixelArt(src: HTMLCanvasElement, style: ArtStyle): HTMLCanvasElement {
  const S = src.width;
  const G = style.gridSize;

  // 1. Smooth downscale to grid size
  const small = document.createElement('canvas');
  small.width = small.height = G;
  const sc = small.getContext('2d')!;
  sc.imageSmoothingEnabled = true;
  sc.imageSmoothingQuality = 'high';
  sc.drawImage(src, 0, 0, G, G);

  // 2. Reduce colors with median-cut
  const id = sc.getImageData(0, 0, G, G);
  const d = id.data;

  // Sample pixels for palette
  const samples: number[][] = [];
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] > 128) samples.push([d[i], d[i + 1], d[i + 2]]);
  }
  const sampled = samples.length > 3000
    ? samples.filter((_, i) => i % Math.ceil(samples.length / 3000) === 0)
    : samples;
  const pal = medianCut(sampled.length ? sampled : [[128, 128, 128]], Math.ceil(Math.log2(style.colors)));

  // Map every pixel to nearest palette color
  for (let i = 0; i < d.length; i += 4) {
    const [r, g, b] = nearest(d[i], d[i + 1], d[i + 2], pal);
    d[i] = r; d[i + 1] = g; d[i + 2] = b;
  }
  sc.putImageData(id, 0, 0);

  // 3. Upscale with nearest-neighbor for crisp pixels
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

// Component
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
                  style={{ maxHeight: '280px', maxWidth: '100%', display: 'block' }} />
              </ReactCrop>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-black uppercase tracking-wider">Art Style</span>
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
              onClick={() => { setSelectedStyle('pixel'); if (imgRef.current) setCrop(centerAspectCrop(imgRef.current.width, imgRef.current.height)); }}>
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
