import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, 
  Trash2,
  Sun,
  Cloud,
  Moon
} from "lucide-react";
import { toast } from "sonner";
import { ArcadeNavbar } from "@/components/ArcadeNavbar";

interface Task {
  id: string;
  title: string;
  subject: string;
  estimatedTime: number;
  completed: boolean;
  period: "morning" | "afternoon" | "night";
}

const Planner = () => {
  const [tasks, setTasks] = useLocalStorage<Task[]>("daily-tasks", []);
  const [newTask, setNewTask] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newTime, setNewTime] = useState(30);
  const [selectedPeriod, setSelectedPeriod] = useState<"morning" | "afternoon" | "night">("morning");

  const addTask = () => {
    if (!newTask.trim()) {
      toast.error("Please enter a task");
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      subject: newSubject,
      estimatedTime: newTime,
      completed: false,
      period: selectedPeriod,
    };

    setTasks([...tasks, task]);
    setNewTask("");
    setNewSubject("");
    setNewTime(30);
    toast.success("Task added!");
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
    toast.success("Task deleted");
  };

  const getTasksByPeriod = (period: "morning" | "afternoon" | "night") => {
    return tasks.filter((task) => task.period === period);
  };

  const calculateProgress = () => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter((task) => task.completed).length;
    return Math.round((completed / tasks.length) * 100);
  };

  const totalTime = tasks.reduce((acc, task) => acc + task.estimatedTime, 0);
  const completedTime = tasks
    .filter((task) => task.completed)
    .reduce((acc, task) => acc + task.estimatedTime, 0);

  const periods = [
    { id: "morning", label: "Morning", icon: Sun, color: "warning" },
    { id: "afternoon", label: "Afternoon", icon: Cloud, color: "primary" },
    { id: "night", label: "Night", icon: Moon, color: "accent" },
  ] as const;

  return (
    <>
      <ArcadeNavbar />
      <div className="min-h-screen bg-background pb-24">
        <div className="bg-card/95 backdrop-blur-sm pixel-border-secondary py-6 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 via-secondary/10 to-secondary/5 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
          <div className="container mx-auto max-w-6xl relative z-10">
            <h1 className="text-2xl sm:text-3xl font-black arcade-text text-secondary flex items-center gap-3">
              📅 STUDY PLANNER
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 uppercase tracking-wider font-bold">Organize your study sessions</p>
          </div>
        </div>

        <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Today's Progress</p>
            <p className="text-3xl font-bold">{calculateProgress()}%</p>
            <p className="text-sm text-muted-foreground mt-2">
              {tasks.filter((t) => t.completed).length} of {tasks.length} tasks
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Study Time</p>
            <p className="text-3xl font-bold">{totalTime}m</p>
            <p className="text-sm text-muted-foreground mt-2">Planned for today</p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Time Completed</p>
            <p className="text-3xl font-bold">{completedTime}m</p>
            <p className="text-sm text-muted-foreground mt-2">
              {totalTime - completedTime}m remaining
            </p>
          </Card>
        </div>

        {/* Add Task */}
        <Card className="p-6 mb-8 shadow-custom-md">
          <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Task</label>
              <Input
                placeholder="e.g., Study 8085 Architecture"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Subject (optional)</label>
              <Input
                placeholder="e.g., Microprocessor"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Estimated Time (minutes)
              </label>
              <Input
                type="number"
                value={newTime}
                onChange={(e) => setNewTime(parseInt(e.target.value) || 30)}
                min={5}
                step={5}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Time Period</label>
              <div className="flex gap-2">
                {periods.map((period) => (
                  <Button
                    key={period.id}
                    variant={selectedPeriod === period.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPeriod(period.id)}
                    className="flex-1"
                  >
                    <period.icon className="h-4 w-4 mr-2" />
                    {period.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={addTask} className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </Card>

        {/* Task Lists by Period */}
        <div className="space-y-8">
          {periods.map((period) => {
            const periodTasks = getTasksByPeriod(period.id);

            return (
              <div key={period.id}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center text-white"
                    style={{ background: `hsl(var(--${period.color}))` }}
                  >
                    <period.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{period.label}</h2>
                    <p className="text-sm text-muted-foreground">
                      {periodTasks.length} tasks •{" "}
                      {periodTasks.reduce((acc, t) => acc + t.estimatedTime, 0)}m
                    </p>
                  </div>
                </div>

                {periodTasks.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No tasks planned for {period.label.toLowerCase()}</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {periodTasks.map((task) => (
                      <Card
                        key={task.id}
                        className="p-4 flex items-center gap-4 hover:shadow-custom-md transition-smooth"
                      >
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => toggleTask(task.id)}
                        />
                        <div className="flex-1">
                          <p
                            className={`font-medium ${
                              task.completed ? "line-through text-muted-foreground" : ""
                            }`}
                          >
                            {task.title}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            {task.subject && (
                              <span className="text-sm text-muted-foreground">
                                {task.subject}
                              </span>
                            )}
                            <span className="text-sm text-muted-foreground">
                              {task.estimatedTime}m
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTask(task.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
};

export default Planner;
