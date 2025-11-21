import { Link } from "react-router-dom";
import { subjects } from "@/data/subjects";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronRight } from "lucide-react";
import { ArcadeNavbar } from "@/components/ArcadeNavbar";

interface SubjectProgress {
  [subjectId: string]: {
    [topicId: string]: boolean;
  };
}

const Subjects = () => {
  const [progress] = useLocalStorage<SubjectProgress>("subject-progress", {});

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

  return (
    <>
      <ArcadeNavbar />
      <div className="min-h-screen bg-background pb-24">
        <div className="bg-card/95 backdrop-blur-sm pixel-border py-6 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
          <div className="container mx-auto max-w-6xl relative z-10">
            <h1 className="text-2xl sm:text-3xl font-black arcade-text text-primary flex items-center gap-3">
              📚 ALL SUBJECTS
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 uppercase tracking-wider font-bold">Track your progress</p>
          </div>
        </div>

        <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subjects.map((subject) => {
            const progressPercent = calculateProgress(subject.id);
            const totalTopics = subject.units.reduce(
              (acc, unit) => acc + unit.topics.length,
              0
            );

            return (
              <Link key={subject.id} to={`/subject/${subject.id}`}>
                <Card className="p-6 hover:shadow-custom-lg transition-smooth cursor-pointer border-l-4" 
                      style={{ borderLeftColor: `hsl(var(--${subject.color}))` }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-12 w-12 rounded-lg flex items-center justify-center text-3xl"
                        style={{ background: `hsl(var(--${subject.color}))` }}
                      >
                        📖
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{subject.name}</h3>
                        <p className="text-sm text-muted-foreground">{subject.code}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{progressPercent}%</span>
                    </div>
                    <Progress value={progressPercent} />
                    
                    <div className="flex justify-between text-sm text-muted-foreground pt-2">
                      <span>{subject.units.length} units</span>
                      <span>{totalTopics} topics</span>
                      <span>
                        Exam: {new Date(subject.examDate).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
};

export default Subjects;
