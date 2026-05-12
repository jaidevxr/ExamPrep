import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { subjects } from "@/data/subjects";
import { useCloudProgress } from "@/hooks/useCloudProgress";
import { useFriends, FriendProfile, FriendProgress } from "@/hooks/useFriends";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Loader2, TrendingUp, Trophy, Target } from "lucide-react";

interface ProgressComparisonProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  friend: FriendProfile;
}

export const ProgressComparison = ({ open, onOpenChange, friend }: ProgressComparisonProps) => {
  const { progress: myProgress } = useCloudProgress();
  const { getFriendProgress, calculateSubjectProgress } = useFriends();
  const [friendProgress, setFriendProgress] = useState<FriendProgress>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && friend) {
      setLoading(true);
      getFriendProgress(friend.id).then((data) => {
        setFriendProgress(data);
        setLoading(false);
      });
    }
  }, [open, friend]);

  // Calculate progress for radar chart
  const radarData = subjects.map((subject) => {
    const myProg = calculateSubjectProgress(subject.id, myProgress);
    const friendProg = calculateSubjectProgress(subject.id, friendProgress);
    return {
      subject: subject.code,
      fullName: subject.name,
      You: myProg,
      Friend: friendProg,
    };
  });

  // Bar chart data
  const barData = subjects.map((subject) => {
    const myProg = calculateSubjectProgress(subject.id, myProgress);
    const friendProg = calculateSubjectProgress(subject.id, friendProgress);
    return {
      name: subject.code,
      fullName: subject.name,
      You: myProg,
      [friend.username || "Friend"]: friendProg,
    };
  });

  // Overall stats
  const myOverall = Math.round(
    subjects.reduce((acc, s) => acc + calculateSubjectProgress(s.id, myProgress), 0) / subjects.length
  );
  const friendOverall = Math.round(
    subjects.reduce((acc, s) => acc + calculateSubjectProgress(s.id, friendProgress), 0) / subjects.length
  );

  const myCompleted = subjects.reduce((acc, subject) => {
    return acc + subject.units.reduce((uAcc, unit) => {
      return uAcc + unit.topics.filter(t => !t.isHeading && myProgress[subject.id]?.[t.id] === true).length;
    }, 0);
  }, 0);

  const friendCompleted = subjects.reduce((acc, subject) => {
    return acc + subject.units.reduce((uAcc, unit) => {
      return uAcc + unit.topics.filter(t => !t.isHeading && friendProgress[subject.id]?.[t.id] === true).length;
    }, 0);
  }, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl minecraft-block bg-card border-4 border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-black arcade-text text-primary flex items-center gap-2">
            <Target className="h-5 w-5" />
            PROGRESS COMPARISON
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* VS Header */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-black text-sm arcade-text">YOU</p>
                  <p className="text-2xl font-black text-primary arcade-text">{myOverall}%</p>
                  <p className="text-[10px] text-muted-foreground">{myCompleted} topics done</p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-2xl font-black arcade-text text-warning">VS</p>
              </div>

              <div className="flex items-center gap-3 flex-1 justify-end">
                <div className="text-right">
                  <p className="font-black text-sm arcade-text">{(friend.username || "Friend").toUpperCase()}</p>
                  <p className="text-2xl font-black text-secondary arcade-text">{friendOverall}%</p>
                  <p className="text-[10px] text-muted-foreground">{friendCompleted} topics done</p>
                </div>
                <Avatar className="h-10 w-10 border-2 border-secondary">
                  <AvatarImage src={friend.avatar_url || undefined} />
                  <AvatarFallback className="bg-secondary/20 text-sm font-black">
                    {friend.username?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Winner badge */}
            {myOverall !== friendOverall && (
              <div className={`flex items-center justify-center gap-2 py-2 px-4 rounded border-2 ${
                myOverall > friendOverall
                  ? "bg-success/10 border-success/30 text-success"
                  : "bg-destructive/10 border-destructive/30 text-destructive"
              }`}>
                <Trophy className="h-4 w-4" />
                <p className="text-xs font-black arcade-text">
                  {myOverall > friendOverall
                    ? `YOU'RE AHEAD BY ${myOverall - friendOverall}%`
                    : `${(friend.username || "FRIEND").toUpperCase()} IS AHEAD BY ${friendOverall - myOverall}%`}
                </p>
              </div>
            )}

            {/* Radar Chart */}
            <Card className="p-4 bg-muted/20 border-2 border-border">
              <h3 className="text-xs font-black arcade-text text-primary mb-3 uppercase tracking-wider">
                📊 Skill Radar
              </h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fontSize: 10, fontWeight: "bold", fill: "hsl(var(--muted-foreground))" }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                    <Radar
                      name="You"
                      dataKey="You"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar
                      name={friend.username || "Friend"}
                      dataKey="Friend"
                      stroke="hsl(var(--secondary))"
                      fill="hsl(var(--secondary))"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "11px", fontWeight: "bold" }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Bar Chart */}
            <Card className="p-4 bg-muted/20 border-2 border-border">
              <h3 className="text-xs font-black arcade-text text-primary mb-3 uppercase tracking-wider">
                📚 Subject Breakdown
              </h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 9, fontWeight: "bold" }}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 9, fontWeight: "bold" }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "2px solid hsl(var(--border))",
                        borderRadius: "0px",
                        fontSize: "11px",
                        fontWeight: "bold",
                      }}
                    />
                    <Bar dataKey="You" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                    <Bar
                      dataKey={friend.username || "Friend"}
                      fill="hsl(var(--secondary))"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Per-subject detail */}
            <div className="space-y-2">
              <h3 className="text-xs font-black arcade-text text-primary uppercase tracking-wider">
                📋 Detailed Comparison
              </h3>
              {subjects.map((subject) => {
                const myProg = calculateSubjectProgress(subject.id, myProgress);
                const friendProg = calculateSubjectProgress(subject.id, friendProgress);
                const leading = myProg > friendProg ? "you" : friendProg > myProg ? "friend" : "tie";

                return (
                  <div key={subject.id} className="p-3 bg-muted/30 rounded border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black truncate flex-1">{subject.name}</p>
                      {leading !== "tie" && (
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                          leading === "you"
                            ? "bg-success/20 text-success"
                            : "bg-destructive/20 text-destructive"
                        }`}>
                          {leading === "you" ? "YOU LEAD" : "BEHIND"}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[9px] text-muted-foreground font-bold mb-1">You: {myProg}%</p>
                        <div className="h-2 bg-muted/50 rounded overflow-hidden">
                          <div
                            className="h-full transition-all duration-500 rounded"
                            style={{ width: `${myProg}%`, background: "hsl(var(--primary))" }}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] text-muted-foreground font-bold mb-1">
                          {friend.username || "Friend"}: {friendProg}%
                        </p>
                        <div className="h-2 bg-muted/50 rounded overflow-hidden">
                          <div
                            className="h-full transition-all duration-500 rounded"
                            style={{ width: `${friendProg}%`, background: "hsl(var(--secondary))" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
