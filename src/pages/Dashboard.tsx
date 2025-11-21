import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { subjects } from "@/data/subjects";
import { ExamCountdown } from "@/components/ExamCountdown";
import { ArcadeTimer } from "@/components/ArcadeTimer";
import { DynamicIsland } from "@/components/DynamicIsland";
import { ExamCalendar } from "@/components/ExamCalendar";
import { ArcadeNavbar } from "@/components/ArcadeNavbar";
import { Card } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useCloudProgress } from "@/hooks/useCloudProgress";
import { 
  Flame, 
  BookOpen, 
  Target, 
  TrendingUp,
  Calendar,
  Clock,
  Zap,
  Loader2
} from "lucide-react";

interface SubjectProgress {
  [subjectId: string]: {
    [topicId: string]: boolean;
  };
}

const Dashboard = () => {
  const { progress, loading } = useCloudProgress();
  const [studyStreak] = useLocalStorage<number>("study-streak", 0);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  const calculateProgress = (subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId);
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

  const overallProgress = useMemo(() => {
    const totalProgress = subjects.reduce(
      (acc, subject) => acc + calculateProgress(subject.id),
      0
    );
    return Math.round(totalProgress / subjects.length);
  }, [progress]);

  const upcomingExam = useMemo(() => {
    const now = new Date();
    const sortedSubjects = [...subjects].sort(
      (a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
    );

    const next = sortedSubjects.find((subject) => {
      const examDate = new Date(subject.examDate);
      examDate.setHours(14, 0, 0, 0);
      return examDate.getTime() >= now.getTime();
    });

    return next || sortedSubjects[sortedSubjects.length - 1];
  }, []);

  const daysUntilNextExam = useMemo(() => {
    const now = new Date();
    if (!upcomingExam) return 0;

    const examDate = new Date(upcomingExam.examDate);
    examDate.setHours(14, 0, 0, 0); // Set to 2 PM

    const diffMs = examDate.getTime() - now.getTime();
    if (diffMs <= 0) return 0;

    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }, [upcomingExam]);

  return (
    <>
      <ArcadeNavbar />
      <div className="min-h-screen w-full relative pb-24">
        {loading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground font-bold">Loading your progress...</p>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 relative z-10 max-w-7xl">
          {/* Dynamic Island */}
          <div className="flex justify-center">
            <DynamicIsland nextExam={upcomingExam} daysUntilExam={daysUntilNextExam} />
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="p-4 bg-card/95 minecraft-block">
              <div className="flex flex-col gap-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-black">Progress</p>
                <p className="text-xl sm:text-2xl font-black text-primary arcade-text">{overallProgress}%</p>
              </div>
            </Card>

            <Card className="p-4 bg-card/95 minecraft-block">
              <div className="flex flex-col gap-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-black">Subjects</p>
                <p className="text-xl sm:text-2xl font-black text-success arcade-text">{subjects.length}</p>
              </div>
            </Card>

            <Card className="p-4 bg-card/95 minecraft-block">
              <div className="flex flex-col gap-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-black">Streak</p>
                <p className="text-xl sm:text-2xl font-black text-warning arcade-text">{studyStreak}</p>
              </div>
            </Card>

            <Card className="p-4 bg-card/95 minecraft-block">
              <div className="flex flex-col gap-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-black">Next Exam</p>
                <p className="text-xl sm:text-2xl font-black text-secondary arcade-text">{daysUntilNextExam}d</p>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Exam Countdowns */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-xl font-black arcade-text text-primary">🎮 EXAM MISSIONS</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode("card")}
                    className={`px-3 py-1.5 text-xs font-black arcade-text border-2 transition-colors ${
                      viewMode === "card"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                    }`}
                  >
                    CARDS
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-1.5 text-xs font-black arcade-text border-2 transition-colors ${
                      viewMode === "list"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                    }`}
                  >
                    LIST
                  </button>
                </div>
              </div>
              <div className={viewMode === "card" ? "space-y-4" : "space-y-2"}>
                {subjects
                  .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
                  .map((subject) => (
                    <Link key={subject.id} to={`/subject/${subject.id}`}>
                      {viewMode === "card" ? (
                        <ExamCountdown 
                          subject={subject} 
                          progress={calculateProgress(subject.id)}
                        />
                      ) : (
                        <div className="bg-card/95 minecraft-block p-3 hover:bg-card transition-colors flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-black text-sm">{subject.name}</h3>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{subject.code}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-xs font-bold text-muted-foreground">
                                {new Date(subject.examDate).toLocaleDateString('en-IN', { 
                                  month: 'short', 
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                            <div className="w-20 h-2 bg-muted/50 minecraft-block overflow-hidden">
                              <div 
                                className="h-full transition-all duration-300"
                                style={{ 
                                  width: `${calculateProgress(subject.id)}%`,
                                  background: `hsl(var(--${subject.color}))`
                                }}
                              />
                            </div>
                            <span className="text-xs font-black text-primary arcade-text w-10 text-right">
                              {calculateProgress(subject.id)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </Link>
                  ))}
              </div>
            </div>

            {/* Arcade Timer & Exam Calendar */}
            <div className="space-y-4">
              <h2 className="text-base sm:text-xl font-black arcade-text text-secondary">⚡ FOCUS ZONE</h2>
              <ArcadeTimer />
              <ExamCalendar />
            </div>
          </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
