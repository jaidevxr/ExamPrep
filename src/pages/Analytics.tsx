import { useMemo } from "react";
import { ArcadeNavbar } from "@/components/ArcadeNavbar";
import { Card } from "@/components/ui/card";
import { subjects } from "@/data/subjects";
import { useCloudProgress } from "@/hooks/useCloudProgress";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, Target, BookOpen, CheckCircle2, Clock, Zap, Loader2 } from "lucide-react";

const Analytics = () => {
  const { progress, loading } = useCloudProgress();
  const [studyStreak] = useLocalStorage<number>("study-streak", 0);

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

  const analyticsData = useMemo(() => {
    const subjectData = subjects.map((subject) => {
      const totalTopics = subject.units.reduce(
        (acc, unit) => acc + unit.topics.length,
        0
      );
      const completedTopics = subject.units.reduce((acc, unit) => {
        return (
          acc +
          unit.topics.filter(
            (topic) => progress[subject.id]?.[topic.id] === true
          ).length
        );
      }, 0);

      return {
        name: subject.code,
        fullName: subject.name,
        completed: completedTopics,
        remaining: totalTopics - completedTopics,
        total: totalTopics,
        progress: calculateProgress(subject.id),
        color: subject.color,
      };
    });

    const totalTopics = subjectData.reduce((acc, s) => acc + s.total, 0);
    const totalCompleted = subjectData.reduce((acc, s) => acc + s.completed, 0);
    const overallProgress = Math.round((totalCompleted / totalTopics) * 100);

    return {
      subjectData,
      totalTopics,
      totalCompleted,
      overallProgress,
    };
  }, [progress]);

  const pieData = [
    { name: "Completed", value: analyticsData.totalCompleted, color: "hsl(var(--success))" },
    { name: "Remaining", value: analyticsData.totalTopics - analyticsData.totalCompleted, color: "hsl(var(--muted))" },
  ];

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

  const upcomingExams = useMemo(() => {
    const now = new Date();
    return subjects
      .map((subject) => {
        const examDate = new Date(subject.examDate);
        examDate.setHours(14, 0, 0, 0);
        const daysLeft = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return {
          ...subject,
          daysLeft,
          progress: calculateProgress(subject.id),
        };
      })
      .filter((s) => s.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [progress]);

  if (loading) {
    return (
      <>
        <ArcadeNavbar />
        <div className="min-h-screen w-full flex items-center justify-center pb-24">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground font-bold">Loading analytics...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ArcadeNavbar />
      <div className="min-h-screen w-full relative pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 relative z-10 max-w-7xl">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black arcade-text text-primary">
              📊 ANALYTICS
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider font-bold">
              Track Your Study Progress
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="p-4 bg-card/95 minecraft-block">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-black">
                    Overall
                  </p>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-primary arcade-text">
                  {analyticsData.overallProgress}%
                </p>
              </div>
            </Card>

            <Card className="p-4 bg-card/95 minecraft-block">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-black">
                    Completed
                  </p>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-success arcade-text">
                  {analyticsData.totalCompleted}
                </p>
              </div>
            </Card>

            <Card className="p-4 bg-card/95 minecraft-block">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-warning" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-black">
                    Remaining
                  </p>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-warning arcade-text">
                  {analyticsData.totalTopics - analyticsData.totalCompleted}
                </p>
              </div>
            </Card>

            <Card className="p-4 bg-card/95 minecraft-block">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-secondary" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-black">
                    Streak
                  </p>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-secondary arcade-text">
                  {studyStreak}
                </p>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress by Subject - Bar Chart */}
            <Card className="p-4 sm:p-6 bg-card/95 minecraft-block">
              <h2 className="text-base sm:text-xl font-black arcade-text text-primary mb-4">
                📚 SUBJECT PROGRESS
              </h2>
              <div className="h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.subjectData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 10, fontWeight: "bold" }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 10, fontWeight: "bold" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "2px solid hsl(var(--border))",
                        borderRadius: "0px",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Bar 
                      dataKey="progress" 
                      fill="hsl(var(--primary))"
                      radius={[0, 0, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Overall Completion - Pie Chart */}
            <Card className="p-4 sm:p-6 bg-card/95 minecraft-block">
              <h2 className="text-base sm:text-xl font-black arcade-text text-primary mb-4">
                🎯 COMPLETION STATUS
              </h2>
              <div className="h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => 
                        `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={80}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "2px solid hsl(var(--border))",
                        borderRadius: "0px",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Subject Details */}
          <Card className="p-4 sm:p-6 bg-card/95 minecraft-block">
            <h2 className="text-base sm:text-xl font-black arcade-text text-primary mb-4">
              📋 DETAILED BREAKDOWN
            </h2>
            <div className="space-y-3">
              {analyticsData.subjectData.map((subject) => (
                <div key={subject.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-black truncate">{subject.fullName}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {subject.completed} / {subject.total} Topics
                      </p>
                    </div>
                    <span className="text-sm sm:text-base font-black text-primary arcade-text ml-2">
                      {subject.progress}%
                    </span>
                  </div>
                  <div className="h-3 bg-muted/50 minecraft-block overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${subject.progress}%`,
                        background: getColorValue(subject.color),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Upcoming Exams Readiness */}
          <Card className="p-4 sm:p-6 bg-card/95 minecraft-block">
            <h2 className="text-base sm:text-xl font-black arcade-text text-primary mb-4">
              ⏰ EXAM READINESS
            </h2>
            <div className="space-y-3">
              {upcomingExams.map((exam) => (
                <div
                  key={exam.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/40 rounded border-2 border-border/50 gap-2"
                >
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-black">{exam.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {exam.daysLeft} days left
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 sm:w-32 h-2 bg-muted/50 minecraft-block overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${exam.progress}%`,
                          background: getColorValue(exam.color),
                        }}
                      />
                    </div>
                    <span className="text-xs font-black text-primary arcade-text w-12 text-right">
                      {exam.progress}%
                    </span>
                  </div>
                </div>
              ))}
              {upcomingExams.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  No upcoming exams
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Analytics;
