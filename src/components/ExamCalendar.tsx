import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { subjects, Subject } from "@/data/subjects";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Calendar as CalendarIcon, Clock, TrendingUp, BookOpen, CheckCircle2, Circle, Zap } from "lucide-react";

interface SubjectProgress {
  [subjectId: string]: {
    [topicId: string]: boolean;
  };
}

export const ExamCalendar = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useLocalStorage<SubjectProgress>("subject-progress", {});
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Create a map of date strings to subject IDs for quick lookup
  const dateToSubjectMap: Record<string, string> = {};
  
  subjects.forEach((subject) => {
    const date = new Date(subject.examDate);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    dateToSubjectMap[dateKey] = subject.id;
  });

  const examDatesByColor: Record<string, Date[]> = {};

  subjects.forEach((subject) => {
    const date = new Date(subject.examDate);
    const key = subject.color || "default";

    if (!examDatesByColor[key]) {
      examDatesByColor[key] = [];
    }

    examDatesByColor[key].push(date);
  });

  const modifiers: Record<string, Date[]> = {};
  const modifiersClassNames: Record<string, string> = {};

  Object.entries(examDatesByColor).forEach(([color, dates]) => {
    const key = `exam_${color}`;

    modifiers[key] = dates;

    const baseColorClass =
      color === "primary"
        ? "bg-primary/20 text-primary border border-primary"
        : color === "secondary"
        ? "bg-secondary/20 text-secondary-foreground border border-secondary"
        : color === "accent"
        ? "bg-accent/20 text-accent-foreground border border-accent"
        : color === "success"
        ? "bg-success/20 text-success-foreground border border-success"
        : color === "warning"
        ? "bg-warning/20 text-warning-foreground border border-warning"
        : color === "destructive"
        ? "bg-destructive/20 text-destructive-foreground border border-destructive"
        : "bg-muted text-foreground border border-border";

    modifiersClassNames[key] = cn(
      "rounded-full cursor-pointer hover:scale-110 transition-transform pointer-events-auto",
      baseColorClass
    );
  });

  const handleDayClick = (date: Date | undefined) => {
    if (!date) return;
    
    const dateKey = date.toISOString().split('T')[0];
    const subjectId = dateToSubjectMap[dateKey];
    
    if (subjectId) {
      const subject = subjects.find(s => s.id === subjectId);
      if (subject) {
        setSelectedSubject(subject);
        setIsDialogOpen(true);
      }
    }
  };

  const calculateTimeLeft = (examDate: string) => {
    const now = new Date();
    const exam = new Date(examDate);
    exam.setHours(14, 0, 0, 0);
    
    const diff = exam.getTime() - now.getTime();
    
    if (diff <= 0) return "Exam started!";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const calculateProgress = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return 0;
    
    const totalTopics = subject.units.reduce(
      (acc, unit) => acc + unit.topics.length,
      0
    );
    const completedTopics = subject.units.reduce((acc, unit) => {
      return (
        acc +
        unit.topics.filter(
          (topic) => progress[subjectId]?.[topic.id] === true
        ).length
      );
    }, 0);

    return totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  };

  const getColorValue = (colorName: string) => {
    const colorMap: Record<string, string> = {
      primary: "hsl(var(--primary))",
      secondary: "hsl(var(--secondary))",
      accent: "hsl(var(--accent))",
      success: "hsl(var(--success))",
      warning: "hsl(var(--warning))",
      destructive: "hsl(var(--destructive))",
    };
    return colorMap[colorName] || "hsl(var(--primary))";
  };

  const toggleTopicCompletion = (topicId: string) => {
    if (!selectedSubject) return;
    
    setProgress((prev) => {
      const subjectProgress = prev[selectedSubject.id] || {};
      const newProgress = {
        ...prev,
        [selectedSubject.id]: {
          ...subjectProgress,
          [topicId]: !subjectProgress[topicId],
        },
      };
      return newProgress;
    });
  };

  const getImportantTopics = () => {
    if (!selectedSubject) return [];
    
    const topics: Array<{ id: string; title: string; unitTitle: string; completed: boolean; important: boolean }> = [];
    
    selectedSubject.units.forEach((unit) => {
      unit.topics.forEach((topic) => {
        if (topic.important) {
          topics.push({
            id: topic.id,
            title: topic.title,
            unitTitle: unit.title,
            completed: progress[selectedSubject.id]?.[topic.id] === true,
            important: topic.important,
          });
        }
      });
    });
    
    return topics.slice(0, 5); // Show top 5 important topics
  };

  const today = new Date();

  return (
    <>
      <Card className="p-4 bg-card/95 minecraft-block">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-xl font-black arcade-text text-primary">
            📅 EXAM CALENDAR
          </h2>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {today.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
          </p>
        </div>
        <div className="space-y-4">
          <div className="[&_.rdp-day]:pointer-events-auto [&_.rdp-day_button]:cursor-pointer">
            <Calendar
              showOutsideDays
              className="pointer-events-auto rounded-lg border border-border/40 bg-background/80"
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              mode="single"
              selected={today}
              onDayClick={handleDayClick}
            />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-black">
              Legend (Click dates to view)
            </p>
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted/60"
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      subject.color === "primary" && "bg-primary",
                      subject.color === "secondary" && "bg-secondary",
                      subject.color === "accent" && "bg-accent",
                      subject.color === "success" && "bg-success",
                      subject.color === "warning" && "bg-warning",
                      subject.color === "destructive" && "bg-destructive",
                    )}
                  />
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {subject.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Exam Info Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg minecraft-block bg-card border-4 border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black arcade-text text-primary flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              EXAM INFO
            </DialogTitle>
          </DialogHeader>
          
          {selectedSubject && (
            <div className="space-y-4 py-4">
              {/* Subject Name */}
              <div className="space-y-1">
                <p className="text-sm font-black">{selectedSubject.name}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                  {selectedSubject.code}
                </p>
              </div>

              {/* Exam Date & Time */}
              <div className="flex items-center gap-2 p-3 bg-muted/40 rounded border-2 border-border">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs font-bold">
                    {new Date(selectedSubject.examDate).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Time Left: {calculateTimeLeft(selectedSubject.examDate)}
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <p className="text-xs font-black uppercase tracking-wider">Your Progress</p>
                  </div>
                  <span className="text-sm font-black text-primary arcade-text">
                    {calculateProgress(selectedSubject.id)}%
                  </span>
                </div>
                <div className="h-3 bg-muted/50 minecraft-block overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${calculateProgress(selectedSubject.id)}%`,
                      background: getColorValue(selectedSubject.color),
                    }}
                  />
                </div>
              </div>

              {/* Quick Actions - Important Topics */}
              {getImportantTopics().length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-warning" />
                    <p className="text-xs font-black uppercase tracking-wider">Important Topics (Click to toggle)</p>
                  </div>
                  <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                    {getImportantTopics().map((topic) => (
                      <div
                        key={topic.id}
                        onClick={() => toggleTopicCompletion(topic.id)}
                        className="flex items-start gap-2 p-2 bg-muted/40 rounded border border-border hover:bg-muted/60 transition-colors cursor-pointer"
                      >
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-[11px] font-semibold leading-tight",
                              topic.completed && "line-through text-muted-foreground"
                            )}
                          >
                            {topic.title}
                          </p>
                          <p className="text-[9px] text-muted-foreground mt-0.5">
                            {topic.unitTitle}
                          </p>
                        </div>
                        {topic.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subject Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-muted/40 rounded border border-border">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Units</p>
                  <p className="text-lg font-black text-primary arcade-text">{selectedSubject.units.length}</p>
                </div>
                <div className="p-2 bg-muted/40 rounded border border-border">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Topics</p>
                  <p className="text-lg font-black text-secondary arcade-text">
                    {selectedSubject.units.reduce((acc, unit) => acc + unit.topics.length, 0)}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={() => {
                  navigate(`/subject/${selectedSubject.id}`);
                  setIsDialogOpen(false);
                }}
                className="w-full font-black arcade-text border-2 border-border"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                VIEW FULL SYLLABUS
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
