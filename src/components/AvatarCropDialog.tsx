import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Loader2, Crop as CropIcon, Sparkles, RotateCcw, Image as ImageIcon } from 'lucide-react';

interface AvatarCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageFile: File | null;
  onComplete: (file: File) => void;
}

// ─── Art Style Presets ───────────────────────────────────────────────
interface ArtStyle {
  id: string;
  label: string;
  emoji: string;
  resolution: number;   // pixel grid size (lower = more detail)
  paletteSize: number;  // color count
  saturationBoost: number;
  contrastBoost: number;
  outlineStrength: number;
  dithering: boolean;
}

const ART_STYLES: ArtStyle[] = [
  { id: 'normal',    label: 'Normal',     emoji: '📷', resolution: 1,  paletteSize: 0,  saturationBoost: 0,   contrastBoost: 0,   outlineStrength: 0,   dithering: false },
  { id: 'retro',     label: 'Retro',      emoji: '🕹️', resolution: 6,  paletteSize: 32, saturationBoost: 0.15, contrastBoost: 0.1,  outlineStrength: 0.3, dithering: true },
  { id: 'pixel',     label: 'Pixel Art',  emoji: '🎮', resolution: 8,  paletteSize: 24, saturationBoost: 0.25, contrastBoost: 0.15, outlineStrength: 0.5, dithering: true },
  { id: 'arcade',    label: 'Arcade',     emoji: '👾', resolution: 10, paletteSize: 16, saturationBoost: 0.35, contrastBoost: 0.2,  outlineStrength: 0.6, dithering: true },
  { id: 'minecraft', label: 'Minecraft',  emoji: '⛏️', resolution: 16, paletteSize: 12, saturationBoost: 0.3,  contrastBoost: 0.25, outlineStrength: 0.8, dithering: false },
];

// ─── Color Quantization (Median Cut) ────────────────────────────────
function medianCut(pixels: number[][], depth: number): number[][] {
  if (depth === 0 || pixels.length === 0) {
    // Average all pixels in this bucket
    const avg = [0, 0, 0];
    for (const p of pixels) {
      avg[0] += p[0]; avg[1] += p[1]; avg[2] += p[2];
    }
    const n = pixels.length || 1;
    return [[Math.round(avg[0] / n), Math.round(avg[1] / n), Math.round(avg[2] / n)]];
  }

  // Find channel with greatest range
  let maxRange = 0, splitChannel = 0;
  for (let ch = 0; ch < 3; ch++) {
    let lo = 255, hi = 0;
    for (const p of pixels) {
      if (p[ch] < lo) lo = p[ch];
      if (p[ch] > hi) hi = p[ch];
    }
    const range = hi - lo;
    if (range > maxRange) { maxRange = range; splitChannel = ch; }
  }

  pixels.sort((a, b) => a[splitChannel] - b[splitChannel]);
  const mid = Math.floor(pixels.length / 2);

  return [
    ...medianCut(pixels.slice(0, mid), depth - 1),
    ...medianCut(pixels.slice(mid), depth - 1),
  ];
}

function buildPalette(imageData: ImageData, paletteSize: number): number[][] {
  const pixels: number[][] = [];
  const d = imageData.data;
  // Sample every 4th pixel for performance
  for (let i = 0; i < d.length; i += 16) {
    if (d[i + 3] > 128) { // skip transparent
      pixels.push([d[i], d[i + 1], d[i + 2]]);
    }
  }
  if (pixels.length === 0) return [[128, 128, 128]];
  const depth = Math.ceil(Math.log2(Math.max(2, paletteSize)));
  return medianCut(pixels, depth);
}

function findClosestColor(r: number, g: number, b: number, palette: number[][]): number[] {
  let best = palette[0], bestDist = Infinity;
  for (const c of palette) {
    // Weighted euclidean distance (human perception)
    const dr = r - c[0], dg = g - c[1], db = b - c[2];
    const dist = 2 * dr * dr + 4 * dg * dg + 3 * db * db;
    if (dist < bestDist) { bestDist = dist; best = c; }
  }
  return best;
}

// ─── Advanced Pixel Art Pipeline ────────────────────────────────────

function applyPixelArt(
  sourceCanvas: HTMLCanvasElement,
  style: ArtStyle
): HTMLCanvasElement {
  const size = sourceCanvas.width; // always square
  
  if (style.id === 'normal') {
    // Just return a copy
    const out = document.createElement('canvas');
    out.width = size; out.height = size;
    out.getContext('2d')!.drawImage(sourceCanvas, 0, 0);
    return out;
  }

  const gridRes = Math.max(8, Math.round(size / style.resolution)); // pixel grid resolution
  
  // Step 1: Downscale to pixel grid
  const smallCanvas = document.createElement('canvas');
  smallCanvas.width = gridRes;
  smallCanvas.height = gridRes;
  const smallCtx = smallCanvas.getContext('2d')!;
  smallCtx.imageSmoothingEnabled = true;
  smallCtx.imageSmoothingQuality = 'high';
  smallCtx.drawImage(sourceCanvas, 0, 0, gridRes, gridRes);

  // Step 2: Get pixel data and process
  const imgData = smallCtx.getImageData(0, 0, gridRes, gridRes);
  const data = imgData.data;

  // 2a: Boost contrast and saturation
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i], g = data[i + 1], b = data[i + 2];

    // Contrast
    const factor = (259 * (255 * style.contrastBoost + 255)) / (255 * (259 - 255 * style.contrastBoost));
    r = Math.max(0, Math.min(255, factor * (r - 128) + 128));
    g = Math.max(0, Math.min(255, factor * (g - 128) + 128));
    b = Math.max(0, Math.min(255, factor * (b - 128) + 128));

    // Saturation boost (convert to HSL-ish, boost, convert back)
    const avg = (r + g + b) / 3;
    r = Math.max(0, Math.min(255, avg + (r - avg) * (1 + style.saturationBoost)));
    g = Math.max(0, Math.min(255, avg + (g - avg) * (1 + style.saturationBoost)));
    b = Math.max(0, Math.min(255, avg + (b - avg) * (1 + style.saturationBoost)));

    data[i] = r; data[i + 1] = g; data[i + 2] = b;
  }

  // 2b: Color quantization with optional dithering
  if (style.paletteSize > 0) {
    const palette = buildPalette(imgData, style.paletteSize);

    for (let y = 0; y < gridRes; y++) {
      for (let x = 0; x < gridRes; x++) {
        const idx = (y * gridRes + x) * 4;
        const oldR = data[idx], oldG = data[idx + 1], oldB = data[idx + 2];
        const [newR, newG, newB] = findClosestColor(oldR, oldG, oldB, palette);
        
        data[idx] = newR; data[idx + 1] = newG; data[idx + 2] = newB;

        // Floyd-Steinberg dithering
        if (style.dithering) {
          const errR = oldR - newR, errG = oldG - newG, errB = oldB - newB;
          const spread = (dx: number, dy: number, factor: number) => {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < gridRes && ny >= 0 && ny < gridRes) {
              const ni = (ny * gridRes + nx) * 4;
              data[ni]     = Math.max(0, Math.min(255, data[ni]     + errR * factor));
              data[ni + 1] = Math.max(0, Math.min(255, data[ni + 1] + errG * factor));
              data[ni + 2] = Math.max(0, Math.min(255, data[ni + 2] + errB * factor));
            }
          };
          spread(1, 0, 7 / 16);
          spread(-1, 1, 3 / 16);
          spread(0, 1, 5 / 16);
          spread(1, 1, 1 / 16);
        }
      }
    }
  }

  smallCtx.putImageData(imgData, 0, 0);

  // Step 3: Scale back up with nearest-neighbor (crisp pixels)
  const outCanvas = document.createElement('canvas');
  outCanvas.width = size;
  outCanvas.height = size;
  const outCtx = outCanvas.getContext('2d')!;
  outCtx.imageSmoothingEnabled = false;
  outCtx.drawImage(smallCanvas, 0, 0, size, size);

  // Step 4: Draw pixel outlines/edges for that hand-drawn pixel art feel
  if (style.outlineStrength > 0) {
    const outData = outCtx.getImageData(0, 0, size, size);
    const od = outData.data;
    const blockSize = Math.round(size / gridRes);

    // For each pixel block, check if neighboring block is significantly different
    for (let by = 0; by < gridRes; by++) {
      for (let bx = 0; bx < gridRes; bx++) {
        const cx = Math.min(bx * blockSize + Math.floor(blockSize / 2), size - 1);
        const cy = Math.min(by * blockSize + Math.floor(blockSize / 2), size - 1);
        const ci = (cy * size + cx) * 4;
        const cr = od[ci], cg = od[ci + 1], cb = od[ci + 2];

        // Check right and bottom neighbors
        const neighbors = [
          { dx: 1, dy: 0, edge: 'right' },
          { dx: 0, dy: 1, edge: 'bottom' },
        ];

        for (const n of neighbors) {
          const nbx = bx + n.dx, nby = by + n.dy;
          if (nbx >= gridRes || nby >= gridRes) continue;

          const ncx = Math.min(nbx * blockSize + Math.floor(blockSize / 2), size - 1);
          const ncy = Math.min(nby * blockSize + Math.floor(blockSize / 2), size - 1);
          const nci = (ncy * size + ncx) * 4;
          const nr = od[nci], ng = od[nci + 1], nb2 = od[nci + 2];

          const diff = Math.abs(cr - nr) + Math.abs(cg - ng) + Math.abs(cb - nb2);

          if (diff > 60) {
            // Draw edge line
            const alpha = Math.min(1, style.outlineStrength * (diff / 200));
            if (n.edge === 'right') {
              const ex = Math.min((bx + 1) * blockSize, size - 1);
              for (let py = by * blockSize; py < Math.min((by + 1) * blockSize, size); py++) {
                const ei = (py * size + ex) * 4;
                const darken = alpha * 0.7;
                od[ei]     = Math.round(od[ei] * (1 - darken));
                od[ei + 1] = Math.round(od[ei + 1] * (1 - darken));
                od[ei + 2] = Math.round(od[ei + 2] * (1 - darken));
              }
            } else {
              const ey = Math.min((by + 1) * blockSize, size - 1);
              for (let px = bx * blockSize; px < Math.min((bx + 1) * blockSize, size); px++) {
                const ei = (ey * size + px) * 4;
                const darken = alpha * 0.7;
                od[ei]     = Math.round(od[ei] * (1 - darken));
                od[ei + 1] = Math.round(od[ei + 1] * (1 - darken));
                od[ei + 2] = Math.round(od[ei + 2] * (1 - darken));
              }
            }
          }
        }
      }
    }
    outCtx.putImageData(outData, 0, 0);
  }

  return outCanvas;
}

// ─── Crop Helper ────────────────────────────────────────────────────

function centerAspectCrop(mediaWidth: number, mediaHeight: number) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 80 }, 1, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

function getCroppedCanvas(
  image: HTMLImageElement,
  crop: Crop,
  outputSize = 256
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext('2d')!;

  // Use naturalWidth/Height for the actual pixel coordinates
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const srcX = crop.x * scaleX;
  const srcY = crop.y * scaleY;
  const srcW = crop.width * scaleX;
  const srcH = crop.height * scaleY;

  // Ensure we use the same dimension for both width and height (square crop)
  const side = Math.min(srcW, srcH);

  ctx.drawImage(
    image,
    srcX, srcY, side, side,
    0, 0, outputSize, outputSize
  );

  return canvas;
}

// ─── Component ──────────────────────────────────────────────────────

export const AvatarCropDialog = ({
  open,
  onOpenChange,
  imageFile,
  onComplete,
}: AvatarCropDialogProps) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [imgSrc, setImgSrc] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>('pixel');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  // Load image when file changes
  useEffect(() => {
    if (!imageFile) {
      setImgSrc('');
      setPreviewUrl(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImgSrc(reader.result as string);
      setPreviewUrl(null);
      setSelectedStyle('pixel');
    };
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height));
  }, []);

  const currentStyle = ART_STYLES.find(s => s.id === selectedStyle) || ART_STYLES[2];

  // Generate preview with debounce
  const generatePreview = useCallback(() => {
    if (!imgRef.current || !completedCrop?.width || !completedCrop?.height) return;

    const cropped = getCroppedCanvas(imgRef.current, completedCrop, 256);
    const result = applyPixelArt(cropped, currentStyle);
    setPreviewUrl(result.toDataURL('image/png'));
  }, [completedCrop, currentStyle]);

  useEffect(() => {
    if (completedCrop?.width && completedCrop?.height) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(generatePreview, 80);
    }
    return () => clearTimeout(debounceTimer.current);
  }, [completedCrop, selectedStyle, generatePreview]);

  const handleSave = async () => {
    if (!imgRef.current || !completedCrop?.width || !completedCrop?.height) return;
    setSaving(true);

    const cropped = getCroppedCanvas(imgRef.current, completedCrop, 256);
    const result = applyPixelArt(cropped, currentStyle);

    result.toBlob(
      (blob) => {
        if (!blob) { setSaving(false); return; }
        const file = new File([blob], 'avatar.png', { type: 'image/png' });
        onComplete(file);
        setSaving(false);
        onOpenChange(false);
      },
      'image/png', 1
    );
  };

  const handleReset = () => {
    setSelectedStyle('pixel');
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg minecraft-block bg-card border-4 border-border max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-black arcade-text text-primary flex items-center gap-2">
            <CropIcon className="h-5 w-5" />
            CRAFT YOUR AVATAR
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Crop Area */}
          {imgSrc && (
            <div className="rounded border-2 border-border overflow-hidden bg-black/20 flex items-center justify-center">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop={false}
              >
                <img
                  ref={imgRef}
                  src={imgSrc}
                  alt="Upload"
                  onLoad={onImageLoad}
                  style={{ maxHeight: '280px', maxWidth: '100%', display: 'block' }}
                />
              </ReactCrop>
            </div>
          )}

          {/* Art Style Selector */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-black uppercase tracking-wider">Art Style</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {ART_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`
                    flex flex-col items-center gap-1 p-2 rounded border-2 transition-all duration-200
                    ${selectedStyle === style.id
                      ? 'border-primary bg-primary/15 scale-[1.03] shadow-md shadow-primary/20'
                      : 'border-border/50 bg-muted/20 hover:border-primary/40 hover:bg-muted/40'
                    }
                  `}
                >
                  <span className="text-lg leading-none">{style.emoji}</span>
                  <span className={`text-[8px] font-black uppercase tracking-wider leading-tight ${
                    selectedStyle === style.id ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {style.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground text-center">
                Preview
              </p>
              <div className="flex justify-center gap-4 items-end">
                {/* Large preview */}
                <div className="text-center space-y-1">
                  <div className="relative inline-block">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-lg border-4 border-primary/30 bg-black"
                      style={{ imageRendering: currentStyle.id === 'normal' ? 'auto' : 'pixelated' }}
                    />
                  </div>
                  <p className="text-[9px] text-muted-foreground font-bold">Profile</p>
                </div>
                {/* Small preview (how it looks in chat/friends) */}
                <div className="text-center space-y-1">
                  <img
                    src={previewUrl}
                    alt="Small preview"
                    className="w-10 h-10 rounded-full border-2 border-border bg-black"
                    style={{ imageRendering: currentStyle.id === 'normal' ? 'auto' : 'pixelated' }}
                  />
                  <p className="text-[9px] text-muted-foreground font-bold">Chat</p>
                </div>
                <div className="text-center space-y-1">
                  <img
                    src={previewUrl}
                    alt="Mini preview"
                    className="w-8 h-8 rounded border border-border bg-black"
                    style={{ imageRendering: currentStyle.id === 'normal' ? 'auto' : 'pixelated' }}
                  />
                  <p className="text-[9px] text-muted-foreground font-bold">List</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              className="font-black arcade-text text-xs border-2 h-10"
              size="sm"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              RESET
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !completedCrop?.width}
              className="flex-1 font-black arcade-text text-xs border-2 h-10"
              size="sm"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  CRAFTING...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                  SAVE AVATAR
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
