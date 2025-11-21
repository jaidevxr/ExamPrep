import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LofiMusicPlayer } from "./LofiMusicPlayer";

type TimerMode = "focus" | "break";

const FOCUS_PRESETS = [15, 25, 45, 60];
const BREAK_PRESETS = [5, 10, 15];

export const ArcadeTimer = () => {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
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
            setIsActive(false);
            if (mode === "focus") {
              toast.success("🎮 LEVEL COMPLETE! Time for a break.", {
                duration: 5000,
              });
              setMode("break");
              setMinutes(breakDuration);
            } else {
              toast.success("⚡ POWER UP! Ready for another round?", {
                duration: 5000,
              });
              setMode("focus");
              setMinutes(focusDuration);
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
    setMinutes(mode === "focus" ? focusDuration : breakDuration);
    setSeconds(0);
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    setMinutes(newMode === "focus" ? focusDuration : breakDuration);
    setSeconds(0);
  };

  const changeDuration = (newDuration: number) => {
    if (mode === "focus") {
      setFocusDuration(newDuration);
    } else {
      setBreakDuration(newDuration);
    }
    setMinutes(newDuration);
    setSeconds(0);
  };

  const formatTime = (m: number, s: number) => {
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4 w-full">
      <div className="relative group w-full">
        {/* Animated particle glow background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
        
        {/* Main timer card */}
        <div className="relative minecraft-block bg-card/90 backdrop-blur-sm p-4 sm:p-6 transition-transform duration-200 hover:scale-[1.02] overflow-hidden">
          <div className="space-y-4">
            {/* Mode selector */}
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => switchMode("focus")}
                className={`font-pixel text-[8px] sm:text-[10px] px-3 py-2 transition-all duration-200 ${
                  mode === "focus"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                } border-2 sm:border-4 border-border hover:translate-y-[-2px]`}
                style={{
                  boxShadow: mode === "focus" 
                    ? "0 0 20px hsla(45, 100%, 60%, 0.6), inset 0 -4px 0 0 rgba(0, 0, 0, 0.3)"
                    : "0 4px 0 0 rgba(0, 0, 0, 0.8)"
                }}
              >
                🎯 FOCUS
              </button>
              <button
                onClick={() => switchMode("break")}
                className={`font-pixel text-[8px] sm:text-[10px] px-3 py-2 transition-all duration-200 ${
                  mode === "break"
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                } border-2 sm:border-4 border-border hover:translate-y-[-2px]`}
                style={{
                  boxShadow: mode === "break"
                    ? "0 0 20px hsla(280, 85%, 65%, 0.6), inset 0 -4px 0 0 rgba(0, 0, 0, 0.3)"
                    : "0 4px 0 0 rgba(0, 0, 0, 0.8)"
                }}
              >
                ☕ BREAK
              </button>
            </div>

            {/* Duration presets - only show when timer is not active */}
            {!isActive && (
              <div className="space-y-2">
                <p className="font-pixel text-[8px] text-center text-muted-foreground uppercase tracking-wider">
                  ⏱️ SET DURATION (MINUTES)
                </p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {(mode === "focus" ? FOCUS_PRESETS : BREAK_PRESETS).map((duration) => (
                    <button
                      key={duration}
                      onClick={() => changeDuration(duration)}
                      className={`font-pixel text-[8px] sm:text-[10px] px-3 py-1.5 transition-all duration-200 ${
                        minutes === duration && seconds === 0
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted"
                      } border-2 border-border hover:translate-y-[-1px]`}
                      style={{
                        boxShadow: minutes === duration && seconds === 0
                          ? "0 0 15px hsla(var(--accent), 0.5), 0 3px 0 0 rgba(0, 0, 0, 0.8)"
                          : "0 3px 0 0 rgba(0, 0, 0, 0.8)"
                      }}
                    >
                      {duration}m
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Timer display */}
            <div className="text-center relative overflow-hidden">
              <div 
                className="inline-block relative"
                style={{
                  filter: isActive 
                    ? `drop-shadow(0 0 30px ${mode === "focus" ? "hsla(45, 100%, 60%, 0.8)" : "hsla(280, 85%, 65%, 0.8)"})` 
                    : "none"
                }}
              >
                <div 
                  className="font-pixel text-4xl sm:text-5xl lg:text-6xl mb-2 tracking-wider pixelated"
                  style={{
                    color: mode === "focus" ? "hsl(45 100% 60%)" : "hsl(280 85% 65%)",
                    textShadow: "4px 4px 0 rgba(0, 0, 0, 1), 2px 2px 0 rgba(0, 0, 0, 0.8)"
                  }}
                >
                  {formatTime(minutes, seconds)}
                </div>
              </div>
              <p className="font-pixel text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">
                {mode === "focus" ? "⚡ POWER MODE" : "🌟 RECHARGE"}
              </p>
            </div>

            {/* Control buttons */}
            <div className="flex gap-2 sm:gap-4 justify-center">
              <button
                onClick={toggleTimer}
                className="font-pixel text-[8px] sm:text-[10px] px-4 sm:px-6 py-2 sm:py-3 bg-primary text-primary-foreground border-2 sm:border-4 border-border hover:translate-y-[-2px] transition-all duration-200"
                style={{
                  boxShadow: "0 0 20px hsla(45, 100%, 60%, 0.6), 0 6px 0 0 rgba(0, 0, 0, 0.8), inset 0 -4px 0 0 rgba(0, 0, 0, 0.3)"
                }}
              >
                {isActive ? "⏸ PAUSE" : "▶ START"}
              </button>
              <button
                onClick={resetTimer}
                className="font-pixel text-[8px] sm:text-[10px] px-4 sm:px-6 py-2 sm:py-3 bg-muted text-muted-foreground border-2 sm:border-4 border-border hover:bg-muted/80 hover:translate-y-[-2px] transition-all duration-200"
                style={{
                  boxShadow: "0 6px 0 0 rgba(0, 0, 0, 0.8)"
                }}
              >
                🔄 RESET
              </button>
            </div>
          </div>
        </div>
      </div>

      <LofiMusicPlayer 
        isPlaying={musicPlaying} 
        onPlayStateChange={setMusicPlaying}
      />
    </div>
  );
};
