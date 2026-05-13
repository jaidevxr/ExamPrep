import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Loader2, Crop as CropIcon, Sparkles, RotateCcw } from 'lucide-react';

interface AvatarCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageFile: File | null;
  onComplete: (file: File) => void;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 80 }, 1, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

/**
 * Pixelate an image on canvas for a retro Minecraft/arcade look.
 * pixelSize controls the block size (bigger = more pixelated).
 */
function pixelateCanvas(
  sourceCanvas: HTMLCanvasElement,
  pixelSize: number
): HTMLCanvasElement {
  const w = sourceCanvas.width;
  const h = sourceCanvas.height;

  const outCanvas = document.createElement('canvas');
  outCanvas.width = w;
  outCanvas.height = h;
  const ctx = outCanvas.getContext('2d')!;

  // Step 1: Draw scaled-down version (this naturally pixelates)
  const smallCanvas = document.createElement('canvas');
  const sw = Math.max(1, Math.round(w / pixelSize));
  const sh = Math.max(1, Math.round(h / pixelSize));
  smallCanvas.width = sw;
  smallCanvas.height = sh;
  const smallCtx = smallCanvas.getContext('2d')!;

  // Turn off smoothing for crisp pixels
  smallCtx.imageSmoothingEnabled = false;
  smallCtx.drawImage(sourceCanvas, 0, 0, sw, sh);

  // Step 2: Scale it back up with no smoothing
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(smallCanvas, 0, 0, sw, sh, 0, 0, w, h);

  return outCanvas;
}

/**
 * Crop the loaded image to the selected region and return a canvas.
 */
function getCroppedCanvas(
  image: HTMLImageElement,
  crop: Crop,
  outputSize = 256
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext('2d')!;

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    outputSize,
    outputSize
  );

  return canvas;
}

export const AvatarCropDialog = ({
  open,
  onOpenChange,
  imageFile,
  onComplete,
}: AvatarCropDialogProps) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [imgSrc, setImgSrc] = useState('');
  const [pixelLevel, setPixelLevel] = useState([8]); // default pixel block size
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

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
    };
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height));
  }, []);

  // Generate the pixelated preview
  const generatePreview = useCallback(() => {
    if (!imgRef.current || !completedCrop?.width || !completedCrop?.height) return;

    const cropped = getCroppedCanvas(imgRef.current, completedCrop, 256);
    const pixelated = pixelateCanvas(cropped, pixelLevel[0]);

    setPreviewUrl(pixelated.toDataURL('image/png'));
  }, [completedCrop, pixelLevel]);

  // Auto-generate preview when crop or pixel level changes
  useEffect(() => {
    if (completedCrop?.width && completedCrop?.height) {
      generatePreview();
    }
  }, [completedCrop, pixelLevel, generatePreview]);

  const handleSave = async () => {
    if (!imgRef.current || !completedCrop?.width || !completedCrop?.height) return;

    setSaving(true);

    const cropped = getCroppedCanvas(imgRef.current, completedCrop, 256);
    const pixelated = pixelateCanvas(cropped, pixelLevel[0]);

    pixelated.toBlob(
      (blob) => {
        if (!blob) {
          setSaving(false);
          return;
        }
        const file = new File([blob], 'avatar.png', { type: 'image/png' });
        onComplete(file);
        setSaving(false);
        onOpenChange(false);
      },
      'image/png',
      1
    );
  };

  const handleReset = () => {
    setPixelLevel([8]);
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
            <div className="rounded border-2 border-border overflow-hidden bg-black/20">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop={false}
                className="max-h-[300px] w-full [&_img]:max-h-[300px] [&_img]:w-full [&_img]:object-contain"
              >
                <img
                  ref={imgRef}
                  src={imgSrc}
                  alt="Upload"
                  onLoad={onImageLoad}
                  style={{ maxHeight: '300px', width: '100%', objectFit: 'contain' }}
                />
              </ReactCrop>
            </div>
          )}

          {/* Pixel Art Controls */}
          <div className="space-y-2 p-3 bg-muted/30 rounded border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-black uppercase tracking-wider">Pixel Art Level</span>
              </div>
              <span className="text-xs font-mono text-primary font-bold">
                {pixelLevel[0] <= 2 ? 'HD' : pixelLevel[0] <= 5 ? 'RETRO' : pixelLevel[0] <= 10 ? 'PIXEL' : pixelLevel[0] <= 16 ? 'BLOCKY' : 'MINECRAFT'}
              </span>
            </div>
            <Slider
              value={pixelLevel}
              onValueChange={setPixelLevel}
              min={1}
              max={24}
              step={1}
              className="touch-manipulation"
            />
            <div className="flex justify-between text-[9px] text-muted-foreground font-bold">
              <span>Original</span>
              <span>Max Pixel</span>
            </div>
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground text-center">
                Preview
              </p>
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-32 h-32 rounded border-4 border-primary/30 bg-black"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  {/* Pixel grid overlay effect */}
                  <div
                    className="absolute inset-0 rounded pointer-events-none opacity-10"
                    style={{
                      backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                      backgroundSize: `${Math.max(2, Math.round(128 / (256 / pixelLevel[0])))}px ${Math.max(2, Math.round(128 / (256 / pixelLevel[0])))}px`,
                    }}
                  />
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
                  PROCESSING...
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
