import { useState, useEffect } from "react";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import { Subject } from "@/data/subjects";

interface DynamicIslandProps {
  nextExam: Subject;
  daysUntilExam: number;
}

export const DynamicIsland = ({ nextExam, daysUntilExam }: DynamicIslandProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getUrgencyColor = () => {
    if (daysUntilExam <= 2) return "destructive";
    if (daysUntilExam <= 5) return "warning";
    return "success";
  };

  const getUrgencyText = () => {
    if (daysUntilExam === 0) return "Today!";
    if (daysUntilExam === 1) return "Tomorrow";
    return `${daysUntilExam} days`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-6 relative z-10">
      <div className="bg-card/95 backdrop-blur-sm minecraft-block px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-base pixelated">⏰</span>
          <div className="flex flex-col">
            <span className="text-xs font-black tracking-wide">{formatTime(currentTime)}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {formatDate(currentTime)}
            </span>
          </div>
        </div>

        <div className="hidden sm:block h-8 w-px bg-primary/30" />

        <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 text-primary" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
              Next Exam
            </span>
          </div>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded border-2 bg-${getUrgencyColor()}/20 border-${getUrgencyColor()}/40`}
          >
            <AlertCircle className={`h-3 w-3 text-${getUrgencyColor()}`} />
            <span
              className={`text-[10px] font-black text-${getUrgencyColor()} arcade-text`}
            >
              {getUrgencyText()}
            </span>
          </div>
        </div>

        <div className="mt-2 sm:mt-0 text-[10px] text-muted-foreground text-right sm:text-left">
          <span className="uppercase tracking-wider">{nextExam.name}</span>
        </div>
      </div>
    </div>
  );
};
