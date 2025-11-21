import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Coffee } from "lucide-react";
import { toast } from "sonner";
import { LofiMusicPlayer } from "./LofiMusicPlayer";

type TimerMode = "focus" | "break";

export const PomodoroTimer = () => {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer completed
            setIsActive(false);
            if (mode === "focus") {
              toast.success("Focus session completed! Time for a break.", {
                duration: 5000,
              });
              setMode("break");
              setMinutes(5);
            } else {
              toast.success("Break's over! Ready for another focus session?", {
                duration: 5000,
              });
              setMode("focus");
              setMinutes(25);
            }
            setSeconds(0);
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds, mode]);

  const toggleTimer = () => {
    const newState = !isActive;
    setIsActive(newState);
    if (mode === "focus") {
      setMusicPlaying(newState);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(mode === "focus" ? 25 : 5);
    setSeconds(0);
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    setMinutes(newMode === "focus" ? 25 : 5);
    setSeconds(0);
  };

  const formatTime = (m: number, s: number) => {
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      <Card className="p-8 shadow-custom-md card-hover">
        <div className="space-y-6">
          <div className="flex gap-2 justify-center">
            <Button
              variant={mode === "focus" ? "default" : "outline"}
              size="sm"
              onClick={() => switchMode("focus")}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Focus
            </Button>
            <Button
              variant={mode === "break" ? "default" : "outline"}
              size="sm"
              onClick={() => switchMode("break")}
              className="flex items-center gap-2"
            >
              <Coffee className="h-4 w-4" />
              Break
            </Button>
          </div>

          <div className="text-center">
            <div className="text-6xl font-bold mb-2 font-mono tracking-tight">
              {formatTime(minutes, seconds)}
            </div>
            <p className="text-muted-foreground">
              {mode === "focus" ? "Time to focus!" : "Take a break"}
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              onClick={toggleTimer}
              size="lg"
              className="flex items-center gap-2"
            >
              {isActive ? (
                <>
                  <Pause className="h-5 w-5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Start
                </>
              )}
            </Button>
            <Button
              onClick={resetTimer}
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-5 w-5" />
              Reset
            </Button>
          </div>
        </div>
      </Card>
      
      <LofiMusicPlayer 
        isPlaying={musicPlaying} 
        onPlayStateChange={setMusicPlaying}
      />
    </div>
  );
};
