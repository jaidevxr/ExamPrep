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
  gridSize: number; paletteSize: number; outlineWeight: number;
  satBoost: number; contrastBoost: number; celShading: number;
}

const ART_STYLES: ArtStyle[] = [
  { id: 'normal',  label: 'Normal',    emoji: '📷', gridSize: 256, paletteSize: 0,  outlineWeight: 0,   satBoost: 0,    contrastBoost: 0,    celShading: 0 },
  { id: 'retro',   label: 'Retro',     emoji: '🕹️', gridSize: 64,  paletteSize: 48, outlineWeight: 0.4, satBoost: 0.12, contrastBoost: 0.08, celShading: 4 },
  { id: 'pixel',   label: 'Pixel Art', emoji: '🎮', gridSize: 48,  paletteSize: 36, outlineWeight: 0.6, satBoost: 0.18, contrastBoost: 0.12, celShading: 5 },
  { id: 'arcade',  label: 'Arcade',    emoji: '👾', gridSize: 36,  paletteSize: 28, outlineWeight: 0.7, satBoost: 0.22, contrastBoost: 0.15, celShading: 6 },
  { id: 'minecraft',label:'Minecraft', emoji: '⛏️', gridSize: 24,  paletteSize: 20, outlineWeight: 0.9, satBoost: 0.15, contrastBoost: 0.2,  celShading: 8 },
];

// ── Median-cut color quantization ──
function medianCut(pixels: number[][], depth: number): number[][] {
  if (depth === 0 || pixels.length === 0) {
    const avg = [0, 0, 0];
    for (const p of pixels) { avg[0] += p[0]; avg[1] += p[1]; avg[2] += p[2]; }
    const n = pixels.length || 1;
    return [[Math.round(avg[0]/n), Math.round(avg[1]/n), Math.round(avg[2]/n)]];
  }
  let maxRange = 0, ch = 0;
  for (let c = 0; c < 3; c++) {
    let lo = 255, hi = 0;
    for (const p of pixels) { if (p[c] < lo) lo = p[c]; if (p[c] > hi) hi = p[c]; }
    if (hi - lo > maxRange) { maxRange = hi - lo; ch = c; }
  }
  pixels.sort((a, b) => a[ch] - b[ch]);
  const mid = pixels.length >> 1;
  return [...medianCut(pixels.slice(0, mid), depth-1), ...medianCut(pixels.slice(mid), depth-1)];
}

function buildPalette(data: Uint8ClampedArray, w: number, h: number, size: number): number[][] {
  const px: number[][] = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i+3] > 128) px.push([data[i], data[i+1], data[i+2]]);
  }
  if (!px.length) return [[128,128,128]];
  // Sample for performance
  const sampled = px.length > 4000 ? px.filter((_, i) => i % Math.ceil(px.length / 4000) === 0) : px;
  return medianCut(sampled, Math.ceil(Math.log2(Math.max(2, size))));
}

function closestColor(r: number, g: number, b: number, pal: number[][]): number[] {
  let best = pal[0], bd = Infinity;
  for (const c of pal) {
    const d = 2*(r-c[0])**2 + 4*(g-c[1])**2 + 3*(b-c[2])**2;
    if (d < bd) { bd = d; best = c; }
  }
  return best;
}

// ── Edge-preserving smooth (simplified bilateral) ──
function bilateralSmooth(data: Uint8ClampedArray, w: number, h: number) {
  const out = new Uint8ClampedArray(data);
  const r = 1, sigmaS = 1.5, sigmaC = 30;
  for (let y = r; y < h-r; y++) {
    for (let x = r; x < w-r; x++) {
      const ci = (y*w+x)*4;
      let sr=0, sg=0, sb=0, wt=0;
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const ni = ((y+dy)*w+(x+dx))*4;
          const spatial = Math.exp(-(dx*dx+dy*dy)/(2*sigmaS*sigmaS));
          const cdiff = Math.abs(data[ci]-data[ni]) + Math.abs(data[ci+1]-data[ni+1]) + Math.abs(data[ci+2]-data[ni+2]);
          const range = Math.exp(-(cdiff*cdiff)/(2*sigmaC*sigmaC));
          const w2 = spatial * range;
          sr += data[ni]*w2; sg += data[ni+1]*w2; sb += data[ni+2]*w2; wt += w2;
        }
      }
      out[ci] = sr/wt; out[ci+1] = sg/wt; out[ci+2] = sb/wt;
    }
  }
  return out;
}

// ── Cel-shading (posterize light levels) ──
function celShade(data: Uint8ClampedArray, levels: number) {
  if (levels <= 0) return;
  const step = 255 / levels;
  for (let i = 0; i < data.length; i += 4) {
    data[i]   = Math.round(Math.round(data[i]   / step) * step);
    data[i+1] = Math.round(Math.round(data[i+1] / step) * step);
    data[i+2] = Math.round(Math.round(data[i+2] / step) * step);
  }
}

// ── Sobel edge detection ──
function sobelEdges(data: Uint8ClampedArray, w: number, h: number): Float32Array {
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w*h; i++) {
    gray[i] = 0.299*data[i*4] + 0.587*data[i*4+1] + 0.114*data[i*4+2];
  }
  const edges = new Float32Array(w * h);
  for (let y = 1; y < h-1; y++) {
    for (let x = 1; x < w-1; x++) {
      const gx = -gray[(y-1)*w+(x-1)] + gray[(y-1)*w+(x+1)]
                 -2*gray[y*w+(x-1)] + 2*gray[y*w+(x+1)]
                 -gray[(y+1)*w+(x-1)] + gray[(y+1)*w+(x+1)];
      const gy = -gray[(y-1)*w+(x-1)] - 2*gray[(y-1)*w+x] - gray[(y-1)*w+(x+1)]
                 +gray[(y+1)*w+(x-1)] + 2*gray[(y+1)*w+x] + gray[(y+1)*w+(x+1)];
      edges[y*w+x] = Math.min(1, Math.sqrt(gx*gx + gy*gy) / 200);
    }
  }
  return edges;
}

// ── Main pixel art pipeline ──
function applyPixelArt(src: HTMLCanvasElement, style: ArtStyle): HTMLCanvasElement {
  const S = src.width;
  if (style.id === 'normal') {
    const o = document.createElement('canvas'); o.width = o.height = S;
    o.getContext('2d')!.drawImage(src, 0, 0); return o;
  }

  const G = style.gridSize; // effective pixel grid

  // 1) Downscale with smoothing to grid size
  const small = document.createElement('canvas'); small.width = small.height = G;
  const sCtx = small.getContext('2d')!;
  sCtx.imageSmoothingEnabled = true;
  sCtx.imageSmoothingQuality = 'high';
  sCtx.drawImage(src, 0, 0, G, G);

  // 2) Edge-preserving bilateral smooth
  const sData = sCtx.getImageData(0, 0, G, G);
  const smoothed = bilateralSmooth(sData.data, G, G);
  const imgData = new ImageData(new Uint8ClampedArray(smoothed), G, G);
  const d = imgData.data;

  // 3) Boost contrast & saturation
  for (let i = 0; i < d.length; i += 4) {
    // Contrast
    const cf = (259*(255*style.contrastBoost+255))/(255*(259-255*style.contrastBoost));
    d[i]   = Math.max(0, Math.min(255, cf*(d[i]-128)+128));
    d[i+1] = Math.max(0, Math.min(255, cf*(d[i+1]-128)+128));
    d[i+2] = Math.max(0, Math.min(255, cf*(d[i+2]-128)+128));
    // Saturation
    const avg = (d[i]+d[i+1]+d[i+2])/3;
    d[i]   = Math.max(0, Math.min(255, avg + (d[i]-avg)*(1+style.satBoost)));
    d[i+1] = Math.max(0, Math.min(255, avg + (d[i+1]-avg)*(1+style.satBoost)));
    d[i+2] = Math.max(0, Math.min(255, avg + (d[i+2]-avg)*(1+style.satBoost)));
  }

  // 4) Cel-shading (posterize to limited light levels)
  celShade(d, style.celShading);

  // 5) Color quantization
  if (style.paletteSize > 0) {
    const pal = buildPalette(d, G, G, style.paletteSize);
    for (let i = 0; i < d.length; i += 4) {
      const [r, g, b] = closestColor(d[i], d[i+1], d[i+2], pal);
      d[i] = r; d[i+1] = g; d[i+2] = b;
    }
  }

  // 6) Detect edges on the quantized image
  const edges = sobelEdges(d, G, G);

  // 7) Draw dark outlines on edges
  for (let i = 0; i < G*G; i++) {
    if (edges[i] > 0.15) {
      const alpha = Math.min(1, edges[i] * style.outlineWeight * 2);
      const pi = i * 4;
      d[pi]   = Math.round(d[pi]   * (1 - alpha * 0.8));
      d[pi+1] = Math.round(d[pi+1] * (1 - alpha * 0.8));
      d[pi+2] = Math.round(d[pi+2] * (1 - alpha * 0.8));
    }
  }

  sCtx.putImageData(imgData, 0, 0);

  // 8) Scale back up with nearest-neighbor (crisp pixels)
  const out = document.createElement('canvas'); out.width = out.height = S;
  const oCtx = out.getContext('2d')!;
  oCtx.imageSmoothingEnabled = false;
  oCtx.drawImage(small, 0, 0, S, S);

  return out;
}

// ── Crop helpers ──
function centerAspectCrop(mw: number, mh: number) {
  return centerCrop(makeAspectCrop({ unit: '%', width: 80 }, 1, mw, mh), mw, mh);
}

function getCroppedCanvas(img: HTMLImageElement, crop: Crop, size = 256): HTMLCanvasElement {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const sx = img.naturalWidth / img.width, sy = img.naturalHeight / img.height;
  const srcX = crop.x*sx, srcY = crop.y*sy;
  const side = Math.min(crop.width*sx, crop.height*sy);
  ctx.drawImage(img, srcX, srcY, side, side, 0, 0, size, size);
  return c;
}

// ── Component ──
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

  const style = ART_STYLES.find(s => s.id === selectedStyle) || ART_STYLES[2];

  const genPreview = useCallback(() => {
    if (!imgRef.current || !completedCrop?.width || !completedCrop?.height) return;
    const cropped = getCroppedCanvas(imgRef.current, completedCrop, 256);
    setPreviewUrl(applyPixelArt(cropped, style).toDataURL('image/png'));
  }, [completedCrop, style]);

  useEffect(() => {
    if (completedCrop?.width && completedCrop?.height) {
      clearTimeout(timer.current);
      timer.current = setTimeout(genPreview, 100);
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

          {/* Style buttons */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-black uppercase tracking-wider">Art Style</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
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

          {/* Preview */}
          {previewUrl && (
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground text-center">Preview</p>
              <div className="flex justify-center gap-4 items-end">
                <div className="text-center space-y-1">
                  <img src={previewUrl} alt="Preview"
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-lg border-4 border-primary/30 bg-black"
                    style={{ imageRendering: style.id === 'normal' ? 'auto' : 'pixelated' }} />
                  <p className="text-[9px] text-muted-foreground font-bold">Profile</p>
                </div>
                <div className="text-center space-y-1">
                  <img src={previewUrl} alt="Small"
                    className="w-10 h-10 rounded-full border-2 border-border bg-black"
                    style={{ imageRendering: style.id === 'normal' ? 'auto' : 'pixelated' }} />
                  <p className="text-[9px] text-muted-foreground font-bold">Chat</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
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
