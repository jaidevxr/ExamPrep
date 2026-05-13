import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Crop as CropIcon, Sparkles, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface AvatarCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageFile: File | null;
  onComplete: (file: File) => void;
}

const PIXEL_STYLES = [
  { id: 'retro', label: 'Retro', emoji: '🕹️',
    prompt: 'Convert this photo into a clean retro 16-bit pixel art portrait. Use a 64x64 pixel grid with around 32 colors. Keep the face, hair, and clothing clearly recognizable. Clean flat shading, no dithering. Square aspect ratio.' },
  { id: 'pixel', label: 'Pixel Art', emoji: '🎮',
    prompt: 'Convert this photo into a beautiful pixel art portrait in the style of modern indie games. Use a 48x48 pixel grid with around 24 colors. Preserve facial features, hair style and clothing accurately. Clean pixel-perfect edges with subtle shading. Square aspect ratio.' },
  { id: 'arcade', label: 'Arcade', emoji: '👾',
    prompt: 'Convert this photo into a bold arcade-style pixel art character portrait. Use a 32x32 pixel grid with around 16 vibrant colors. Keep the person recognizable with exaggerated features. Bold dark outlines around shapes. Square aspect ratio.' },
  { id: 'minecraft', label: 'Minecraft', emoji: '⛏️',
    prompt: 'Convert this photo into a Minecraft-style blocky pixel art portrait. Use a 16x16 to 24x24 pixel grid with limited earthy colors like Minecraft. The person should still be recognizable. Very blocky square pixels. Square aspect ratio.' },
];

function centerAspectCrop(mw: number, mh: number) {
  return centerCrop(makeAspectCrop({ unit: '%', width: 80 }, 1, mw, mh), mw, mh);
}

function getCroppedCanvas(img: HTMLImageElement, crop: Crop, size = 512): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const sx = img.naturalWidth / img.width;
  const sy = img.naturalHeight / img.height;
  const side = Math.min(crop.width * sx, crop.height * sy);
  ctx.drawImage(img, crop.x * sx, crop.y * sy, side, side, 0, 0, size, size);
  return c;
}

async function canvasToBase64(canvas: HTMLCanvasElement): Promise<string> {
  return canvas.toDataURL('image/png').split(',')[1];
}

async function generatePixelArt(base64Image: string, stylePrompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini API key not configured');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: stylePrompt },
            { inlineData: { mimeType: 'image/png', data: base64Image } }
          ]
        }]
      })
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error('No response from Gemini');

  for (const part of parts) {
    if (part.inlineData?.data) {
      return part.inlineData.data;
    }
  }
  throw new Error('No image generated. Try a different style or photo.');
}

function base64ToBlob(base64: string, type = 'image/png'): Blob {
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type });
}

export const AvatarCropDialog = ({ open, onOpenChange, imageFile, onComplete }: AvatarCropDialogProps) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [imgSrc, setImgSrc] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('pixel');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedBase64, setGeneratedBase64] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imageFile) { setImgSrc(''); setPreviewUrl(null); setGeneratedBase64(null); return; }
    const r = new FileReader();
    r.onload = () => { setImgSrc(r.result as string); setPreviewUrl(null); setGeneratedBase64(null); setSelectedStyle('pixel'); };
    r.readAsDataURL(imageFile);
  }, [imageFile]);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    setCrop(centerAspectCrop(e.currentTarget.width, e.currentTarget.height));
  }, []);

  const style = PIXEL_STYLES.find(s => s.id === selectedStyle) || PIXEL_STYLES[1];

  const handleGenerate = async () => {
    if (!imgRef.current || !completedCrop?.width || !completedCrop?.height) {
      toast.error('Please select a crop area first');
      return;
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      toast.error('Please add your Gemini API key to .env (VITE_GEMINI_API_KEY)');
      return;
    }

    setGenerating(true);
    setPreviewUrl(null);
    setGeneratedBase64(null);

    try {
      const cropped = getCroppedCanvas(imgRef.current, completedCrop, 512);
      const base64 = await canvasToBase64(cropped);
      const resultBase64 = await generatePixelArt(base64, style.prompt);
      setGeneratedBase64(resultBase64);
      setPreviewUrl(`data:image/png;base64,${resultBase64}`);
      toast.success('Pixel art generated! ✨');
    } catch (error: any) {
      console.error('Pixel art generation error:', error);
      toast.error(error.message || 'Failed to generate pixel art');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = () => {
    if (!generatedBase64) return;
    setSaving(true);
    const blob = base64ToBlob(generatedBase64);
    const file = new File([blob], 'avatar.png', { type: 'image/png' });
    onComplete(file);
    setSaving(false);
    onOpenChange(false);
  };

  // Reset clears the generated preview
  const handleReset = () => {
    setSelectedStyle('pixel');
    setPreviewUrl(null);
    setGeneratedBase64(null);
    if (imgRef.current) setCrop(centerAspectCrop(imgRef.current.width, imgRef.current.height));
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
          {/* Crop area */}
          {imgSrc && (
            <div className="rounded border-2 border-border overflow-hidden bg-black/20 flex items-center justify-center">
              <ReactCrop crop={crop} onChange={setCrop} onComplete={setCompletedCrop} aspect={1}>
                <img ref={imgRef} src={imgSrc} alt="Upload" onLoad={onImageLoad}
                  style={{ maxHeight: '260px', maxWidth: '100%', display: 'block' }} />
              </ReactCrop>
            </div>
          )}

          {/* Style selector */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-black uppercase tracking-wider">Pixel Art Style</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {PIXEL_STYLES.map((s) => (
                <button key={s.id} onClick={() => { setSelectedStyle(s.id); setPreviewUrl(null); setGeneratedBase64(null); }}
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

          {/* Generate button */}
          <Button onClick={handleGenerate} disabled={generating || !completedCrop?.width}
            className="w-full font-black arcade-text text-xs border-2 h-11"
            variant={previewUrl ? 'outline' : 'default'}>
            {generating ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> GENERATING WITH AI...</>
            ) : previewUrl ? (
              <><Sparkles className="h-4 w-4 mr-2" /> RE-GENERATE</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> GENERATE PIXEL ART</>
            )}
          </Button>

          {generating && (
            <div className="text-center py-2">
              <p className="text-[10px] text-muted-foreground font-bold animate-pulse">
                ✨ Gemini is crafting your pixel art portrait... this takes ~10 seconds
              </p>
            </div>
          )}

          {/* Preview */}
          {previewUrl && (
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground text-center">
                AI Generated Preview
              </p>
              <div className="flex justify-center gap-4 items-end">
                <div className="text-center space-y-1">
                  <img src={previewUrl} alt="Preview"
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-lg border-4 border-primary/30 bg-black"
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

          {/* Save / Reset */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="font-black arcade-text text-xs border-2 h-10"
              onClick={handleReset}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> RESET
            </Button>
            <Button size="sm" className="flex-1 font-black arcade-text text-xs border-2 h-10"
              onClick={handleSave} disabled={saving || !generatedBase64}>
              {saving ? <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> SAVING...</>
                : <><Sparkles className="h-3.5 w-3.5 mr-1" /> SAVE AVATAR</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
