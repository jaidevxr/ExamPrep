import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { subjects } from "@/data/subjects";
import { Clock, Zap } from "lucide-react";

interface AlphaLearningSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (duration: number, subjectId: string, musicEnabled: boolean) => void;
}

export const AlphaLearningSetup = ({ open, onOpenChange, onStart }: AlphaLearningSetupProps) => {
  const [duration, setDuration] = useState<number>(25);
  const [subjectId, setSubjectId] = useState<string>("");
  const [musicEnabled, setMusicEnabled] = useState(true);

  const handleStart = () => {
    if (!subjectId) return;
    onStart(duration, subjectId, musicEnabled);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black arcade-text">
            <Zap className="h-6 w-6 text-warning" />
            ALPHA LEARNING MODE
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Duration Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-black uppercase tracking-wider">Study Duration</Label>
            <Select value={duration.toString()} onValueChange={(v) => setDuration(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>15 minutes</span>
                  </div>
                </SelectItem>
                <SelectItem value="25">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>25 minutes (Pomodoro)</span>
                  </div>
                </SelectItem>
                <SelectItem value="30">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>30 minutes</span>
                  </div>
                </SelectItem>
                <SelectItem value="45">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>45 minutes</span>
                  </div>
                </SelectItem>
                <SelectItem value="60">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>60 minutes</span>
                  </div>
                </SelectItem>
                <SelectItem value="90">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>90 minutes</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subject Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-black uppercase tracking-wider">Select Subject</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a subject to study" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ background: `hsl(var(--${subject.color}))` }}
                      />
                      <span className="font-bold">{subject.name}</span>
                      <span className="text-xs text-muted-foreground">({subject.code})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Music Toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <Label htmlFor="music-toggle" className="text-sm font-bold cursor-pointer">
              Enable Study Music
            </Label>
            <Switch
              id="music-toggle"
              checked={musicEnabled}
              onCheckedChange={setMusicEnabled}
            />
          </div>

          {/* Info Box */}
          <div className="bg-warning/10 border-2 border-warning/20 rounded-lg p-3 space-y-2">
            <p className="text-xs font-bold text-warning">⚡ DISTRACTION-FREE MODE</p>
            <p className="text-xs text-muted-foreground">
              All navigation and distractions will be blocked during your study session. 
              Focus on completing your syllabus topics!
            </p>
          </div>

          {/* Start Button */}
          <Button 
            onClick={handleStart} 
            disabled={!subjectId}
            className="w-full font-black arcade-text text-lg h-12"
            size="lg"
          >
            <Zap className="h-5 w-5 mr-2" />
            START ALPHA MODE
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
