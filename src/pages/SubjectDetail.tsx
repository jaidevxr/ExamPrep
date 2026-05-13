import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { subjects } from "@/data/subjects";
import { useCloudProgress } from "@/hooks/useCloudProgress";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useResources, Resource } from "@/hooks/useResources";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  Star, 
  BookMarked, 
  Calendar,
  CheckCircle2,
  Circle,
  Loader2,
  ScrollText,
  BookOpen,
  Download,
  Eye
} from "lucide-react";
import { toast } from "sonner";
import { ArcadeNavbar } from "@/components/ArcadeNavbar";

interface ImportantTopics {
  [subjectId: string]: {
    [topicId: string]: boolean;
  };
}

const SubjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { progress, updateProgress, loading } = useCloudProgress();
  const [importantTopics, setImportantTopics] = useLocalStorage<ImportantTopics>("important-topics", {});
  const [filter, setFilter] = useState<"all" | "completed" | "pending" | "important">("all");
  const { resources, loadResources } = useResources();
  const [showResources, setShowResources] = useState(false);

  // Load resources for this subject
  const subjectResources = useMemo(() => resources.filter(r => r.subject_id === id), [resources, id]);
  const pyqs = subjectResources.filter(r => r.type === 'pyq');
  const notes = subjectResources.filter(r => r.type === 'notes');

  const subject = subjects.find((s) => s.id === id);

  const toggleTopic = async (topicId: string) => {
    if (!subject) return;
    
    const isCompleted = progress[subject.id]?.[topicId] === true;
    await updateProgress(subject.id, topicId, !isCompleted);

    if (!isCompleted) {
      toast.success("Topic completed! Keep going!", {
        duration: 2000,
      });
    }
  };

  const toggleImportant = (topicId: string) => {
    if (!subject) return;
    
    const newImportant = { ...importantTopics };
    if (!newImportant[subject.id]) {
      newImportant[subject.id] = {};
    }
    newImportant[subject.id][topicId] = !newImportant[subject.id][topicId];
    setImportantTopics(newImportant);
  };

  const calculateUnitProgress = (unitId: string) => {
    if (!subject) return 0;
    const unit = subject.units.find((u) => u.id === unitId);
    if (!unit) return 0;

    const nonHeadingTopics = unit.topics.filter((topic) => !topic.isHeading);
    const completed = nonHeadingTopics.filter(
      (topic) => progress[subject.id]?.[topic.id] === true
    ).length;
    return nonHeadingTopics.length > 0 
      ? Math.round((completed / nonHeadingTopics.length) * 100)
      : 0;
  };

  const overallProgress = useMemo(() => {
    if (!subject) return 0;
    const totalTopics = subject.units.reduce(
      (acc, unit) => acc + unit.topics.filter((topic) => !topic.isHeading).length,
      0
    );
    const completedTopics = subject.units.reduce((acc, unit) => {
      return (
        acc +
        unit.topics.filter(
          (topic) => !topic.isHeading && progress[subject.id]?.[topic.id] === true
        ).length
      );
    }, 0);

    return totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  }, [subject, progress]);

  const daysUntilExam = useMemo(() => {
    if (!subject) return 0;
    const now = new Date();
    const examDate = new Date(subject.examDate);
    return Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }, [subject]);

  if (loading) {
    return (
      <>
        <ArcadeNavbar />
        <div className="min-h-screen bg-background pb-24 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground font-bold">Loading progress...</p>
          </div>
        </div>
      </>
    );
  }

  if (!subject) {
    return (
      <>
        <ArcadeNavbar />
        <div className="min-h-screen bg-background pb-24 flex items-center justify-center">
          <Card className="p-8 text-center minecraft-block">
            <p className="text-muted-foreground font-bold">Subject not found</p>
            <Link to="/subjects">
              <Button className="mt-4">Go back</Button>
            </Link>
          </Card>
        </div>
      </>
    );
  }

  const filteredUnits = subject.units.map((unit) => ({
    ...unit,
    topics: unit.topics.filter((topic) => {
      // Always show headings in "all" view
      if (filter === "all") return true;
      // Don't show headings in filtered views
      if (topic.isHeading) return false;
      if (filter === "completed") return progress[subject.id]?.[topic.id] === true;
      if (filter === "pending") return !progress[subject.id]?.[topic.id];
      if (filter === "important") return importantTopics[subject.id]?.[topic.id] === true;
      return true;
    }),
  })).filter((unit) => unit.topics.length > 0);

  return (
    <>
      <ArcadeNavbar />
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b shadow-custom-sm">
          <div className="container mx-auto max-w-6xl px-4 py-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div 
                    className="h-10 w-10 rounded-lg flex items-center justify-center text-white"
                    style={{ background: `hsl(var(--${subject.color}))` }}
                  >
                    <BookMarked className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold">{subject.name}</h1>
                    <p className="text-sm text-muted-foreground">{subject.code}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Overall Progress</p>
                <p className="text-3xl font-bold">{overallProgress}%</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <Progress value={overallProgress} className="mt-4" />
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Days Until Exam</p>
                <p className="text-3xl font-bold">{daysUntilExam}</p>
              </div>
              <Calendar className="h-10 w-10 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              {new Date(subject.examDate).toLocaleDateString('en-IN', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Topics</p>
                <p className="text-3xl font-bold">
                  {subject.units.reduce((acc, u) => acc + u.topics.filter(t => !t.isHeading).length, 0)}
                </p>
              </div>
              <Circle className="h-10 w-10 text-secondary" />
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              {subject.units.length} units to cover
            </p>
          </Card>
        </div>

        {/* Notes & PYQ Buttons */}
        {(pyqs.length > 0 || notes.length > 0) && (
          <div className="mb-6">
            <div className="flex gap-2 mb-3">
              {notes.length > 0 && (
                <Button
                  variant={showResources ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowResources(!showResources)}
                  className="font-bold text-xs"
                >
                  <BookOpen className="h-3.5 w-3.5 mr-1" />
                  Notes ({notes.length})
                </Button>
              )}
              {pyqs.length > 0 && (
                <Button
                  variant={showResources ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowResources(!showResources)}
                  className="font-bold text-xs"
                >
                  <ScrollText className="h-3.5 w-3.5 mr-1" />
                  PYQs ({pyqs.length})
                </Button>
              )}
              <span className="ml-auto text-xs text-muted-foreground font-bold flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {daysUntilExam > 0 ? `${daysUntilExam} days left` : 'Exam passed'}
              </span>
            </div>
            {showResources && (
              <div className="grid gap-2">
                {subjectResources.map(r => (
                  <Card key={r.id} className="p-3 flex items-center gap-3">
                    <div className={`p-1.5 rounded ${r.type === 'pyq' ? 'bg-orange-500/20' : 'bg-blue-500/20'}`}>
                      {r.type === 'pyq' ? <ScrollText className="h-4 w-4 text-orange-500" /> : <BookOpen className="h-4 w-4 text-blue-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{r.title}</p>
                      <p className="text-[10px] text-muted-foreground">{r.type.toUpperCase()} {r.year ? `• ${r.year}` : ''}</p>
                    </div>
                    <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => window.open(r.file_url, '_blank')}>
                      <Eye className="h-3 w-3 mr-1" /> View
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-[10px]" asChild>
                      <a href={r.file_url} download><Download className="h-3 w-3 mr-1" /> Download</a>
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All Topics
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("pending")}
          >
            Pending
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("completed")}
          >
            Completed
          </Button>
          <Button
            variant={filter === "important" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("important")}
          >
            <Star className="h-4 w-4 mr-2" />
            Important
          </Button>
        </div>

        {/* Units & Topics */}
        <div className="space-y-6">
          {filteredUnits.map((unit) => (
            <Card key={unit.id} className="p-6 shadow-custom-md">
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">{unit.title}</h2>
                <div className="flex items-center gap-4">
                  <Progress value={calculateUnitProgress(unit.id)} className="flex-1" />
                  <span className="text-sm font-medium">{calculateUnitProgress(unit.id)}%</span>
                </div>
              </div>

              <div className="space-y-3">
                {unit.topics.map((topic) => (
                  topic.isHeading ? (
                    <div
                      key={topic.id}
                      className="mt-4 mb-2"
                    >
                      <h3 className="text-base font-bold text-foreground">
                        {topic.title}
                      </h3>
                    </div>
                  ) : (
                    <div
                      key={topic.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-smooth"
                    >
                      <Checkbox
                        checked={progress[subject.id]?.[topic.id] === true}
                        onCheckedChange={() => toggleTopic(topic.id)}
                      />
                      <span
                        className={`flex-1 ${
                          progress[subject.id]?.[topic.id] === true
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {topic.title}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleImportant(topic.id)}
                        className={
                          importantTopics[subject.id]?.[topic.id] === true
                            ? "text-warning"
                            : "text-muted-foreground"
                        }
                      >
                        <Star
                          className="h-4 w-4"
                          fill={
                            importantTopics[subject.id]?.[topic.id] === true
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </Button>
                    </div>
                  )
                ))}
              </div>
            </Card>
          ))}

          {filteredUnits.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No topics match the current filter</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setFilter("all")}
              >
                Show all topics
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default SubjectDetail;
