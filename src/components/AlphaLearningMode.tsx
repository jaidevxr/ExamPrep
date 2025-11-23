import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useAlphaLearning } from "@/contexts/AlphaLearningContext";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { subjects } from "@/data/subjects";
import { useCloudProgress } from "@/hooks/useCloudProgress";
import { X, Clock, Target, CheckCircle2, Music, VolumeX, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";

export const AlphaLearningMode = () => {
  const { session, endSession } = useAlphaLearning();
  const { progress, updateProgress } = useCloudProgress();
  const { isPlaying, setIsPlaying, volume, setVolume, muted, setMuted } = useMusicPlayer();
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [isConfirmingExit, setIsConfirmingExit] = useState(false);

  const subject = subjects.find((s) => s.id === session?.subjectId);

  useEffect(() => {
    if (!session) return;
    setTimeLeft(session.duration * 60);
  }, [session]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          toast.success("🎉 Study session complete! Great work!");
          endSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, endSession]);

  useEffect(() => {
    if (session?.isMusicEnabled && !isPlaying) {
      setIsPlaying(true);
    }
  }, [session, isPlaying, setIsPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage = useMemo(() => {
    if (!session || !subject) return 0;
    const totalTopics = subject.units.reduce((acc, unit) => acc + unit.topics.length, 0);
    const completedTopics = subject.units.reduce((acc, unit) => {
      return acc + unit.topics.filter((topic) => progress[subject.id]?.[topic.id] === true).length;
    }, 0);
    return totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  }, [subject, progress, session]);

  const handleExit = () => {
    if (isConfirmingExit) {
      setIsPlaying(false);
      endSession();
      toast.info("Study session ended");
    } else {
      setIsConfirmingExit(true);
      setTimeout(() => setIsConfirmingExit(false), 3000);
    }
  };

  if (!session || !subject) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ background: `hsl(var(--${subject.color}))` }}
                />
                <h1 className="text-xl font-black arcade-text">{subject.name}</h1>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4" />
                <span className="font-bold">{progressPercentage}% Complete</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Timer */}
              <Card className="px-4 py-2 bg-warning/10 border-warning/20">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-warning" />
                  <span className="text-xl font-black arcade-text text-warning">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </Card>

              {/* Exit Button */}
              <Button
                onClick={handleExit}
                variant={isConfirmingExit ? "destructive" : "outline"}
                size="sm"
                className="font-black"
              >
                <X className="h-4 w-4 mr-2" />
                {isConfirmingExit ? "CONFIRM EXIT" : "EXIT"}
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="grid gap-6">
            {/* Music Controls (if enabled) */}
            {session.isMusicEnabled && (
              <Card className="p-4 bg-card/95">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Music className="h-5 w-5 text-primary" />
                    <span className="font-black text-sm">Study Music</span>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-1 max-w-md">
                    <Button
                      onClick={() => setIsPlaying(!isPlaying)}
                      size="sm"
                      variant={isPlaying ? "default" : "outline"}
                      className="font-black"
                    >
                      {isPlaying ? "PAUSE" : "PLAY"}
                    </Button>

                    <Button
                      onClick={() => setMuted(!muted)}
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                    >
                      {muted || volume?.[0] === 0 ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>

                    <Slider
                      value={volume || [70]}
                      onValueChange={setVolume}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* Syllabus Units */}
            {subject.units.map((unit) => (
              <Card key={unit.id} className="p-6 bg-card/95">
                <h3 className="text-lg font-black arcade-text mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  {unit.title}
                </h3>
                
                <div className="space-y-3">
                  {unit.topics.map((topic) => {
                    const isCompleted = progress[subject.id]?.[topic.id] === true;
                    
                    return (
                      <div
                        key={topic.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          id={topic.id}
                          checked={isCompleted}
                          onCheckedChange={(checked) => 
                            updateProgress(subject.id, topic.id, checked === true)
                          }
                          className="mt-1"
                        />
                        <label
                          htmlFor={topic.id}
                          className={`flex-1 cursor-pointer ${
                            isCompleted ? "line-through text-muted-foreground" : "font-medium"
                          }`}
                        >
                          {topic.title}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
