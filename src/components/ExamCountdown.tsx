import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Subject } from "@/data/subjects";

interface ExamCountdownProps {
  subject: Subject;
  progress: number;
}

export const ExamCountdown = ({ subject, progress }: ExamCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const examDate = new Date(subject.examDate);
      const diff = examDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Exam day!");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      if (days === 0) {
        setTimeLeft(`${hours} hours left`);
      } else if (days === 1) {
        setTimeLeft(`Tomorrow`);
      } else {
        setTimeLeft(`${days} days left`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [subject.examDate]);

  const getUrgencyColor = () => {
    const now = new Date();
    const examDate = new Date(subject.examDate);
    const daysLeft = Math.floor((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 2) return "text-destructive";
    if (daysLeft <= 5) return "text-warning";
    return "text-muted-foreground";
  };

  return (
    <Card className="p-6 transition-smooth card-hover bg-card/95 relative overflow-hidden group minecraft-block">
      {/* Hover glow effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, hsla(var(--${subject.color}), 0.15), transparent 70%)`,
        }}
      />
      
      <div className="space-y-4 relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div>
              <h3 className="font-black text-base group-hover:text-primary transition-colors tracking-wide leading-tight">{subject.name}</h3>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">{subject.code}</p>
            </div>
          </div>
          <div className={`text-right ${getUrgencyColor()}`}>
            <div className="flex items-center gap-2 justify-end bg-muted/50 px-3 py-2 minecraft-block">
              <p className="text-sm font-black">{timeLeft}</p>
            </div>
            <p className="text-xs font-bold mt-2">
              {new Date(subject.examDate).toLocaleDateString('en-IN', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground uppercase tracking-wider font-black text-xs">Progress</span>
            <span className="font-black text-primary arcade-text text-sm">{progress}%</span>
          </div>
          <div className="h-4 bg-muted/50 overflow-hidden relative minecraft-block">
            <div 
              className="h-full transition-all duration-700 relative"
              style={{ 
                width: `${progress}%`,
                background: `hsl(var(--${subject.color}))`,
                boxShadow: `inset 0 -2px 0 0 rgba(0, 0, 0, 0.3), inset 0 2px 0 0 rgba(255, 255, 255, 0.2)`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" 
                   style={{ backgroundSize: '200% 100%' }} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
