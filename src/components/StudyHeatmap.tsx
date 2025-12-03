import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, subDays, startOfDay, eachDayOfInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ActivityData {
  [date: string]: number;
}

export const StudyHeatmap = () => {
  const { user } = useAuth();
  const [activityData, setActivityData] = useState<ActivityData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivityData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch all completed_at timestamps from the last 365 days
        const startDate = subDays(new Date(), 365);
        
        const { data, error } = await supabase
          .from("study_progress")
          .select("completed_at")
          .eq("user_id", user.id)
          .eq("completed", true)
          .gte("completed_at", startDate.toISOString());

        if (error) throw error;

        // Count completions per day
        const counts: ActivityData = {};
        data?.forEach((record) => {
          if (record.completed_at) {
            const dateKey = format(new Date(record.completed_at), "yyyy-MM-dd");
            counts[dateKey] = (counts[dateKey] || 0) + 1;
          }
        });

        setActivityData(counts);
      } catch (error) {
        console.error("Error fetching activity data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, [user]);

  const { weeks, months, maxCount, totalContributions, weeklyStats, monthlyStats } = useMemo(() => {
    const today = startOfDay(new Date());
    const startDate = subDays(today, 364); // 365 days including today
    
    const days = eachDayOfInterval({ start: startDate, end: today });
    
    // Group days into weeks (columns)
    const weeksArray: Date[][] = [];
    let currentWeek: Date[] = [];
    
    days.forEach((day, index) => {
      const dayOfWeek = day.getDay();
      
      // Start a new week on Sunday
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeksArray.push(currentWeek);
        currentWeek = [];
      }
      
      currentWeek.push(day);
      
      // Push the last week
      if (index === days.length - 1) {
        weeksArray.push(currentWeek);
      }
    });

    // Get unique months for labels
    const monthsSet = new Map<number, string>();
    days.forEach((day) => {
      const weekIndex = weeksArray.findIndex((week) => 
        week.some((d) => format(d, "yyyy-MM-dd") === format(day, "yyyy-MM-dd"))
      );
      if (day.getDate() <= 7 && !monthsSet.has(weekIndex)) {
        monthsSet.set(weekIndex, format(day, "MMM"));
      }
    });

    // Calculate max count for color intensity
    const max = Math.max(...Object.values(activityData), 1);
    const total = Object.values(activityData).reduce((sum, count) => sum + count, 0);

    // Weekly stats calculation
    const thisWeekStart = startOfWeek(today, { weekStartsOn: 0 });
    const thisWeekEnd = endOfWeek(today, { weekStartsOn: 0 });
    const lastWeekStart = subDays(thisWeekStart, 7);
    const lastWeekEnd = subDays(thisWeekEnd, 7);

    let thisWeekCount = 0;
    let lastWeekCount = 0;

    Object.entries(activityData).forEach(([dateStr, count]) => {
      const date = new Date(dateStr);
      if (isWithinInterval(date, { start: thisWeekStart, end: thisWeekEnd })) {
        thisWeekCount += count;
      } else if (isWithinInterval(date, { start: lastWeekStart, end: lastWeekEnd })) {
        lastWeekCount += count;
      }
    });

    const weeklyChange = lastWeekCount > 0 
      ? Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100)
      : thisWeekCount > 0 ? 100 : 0;

    // Monthly stats calculation
    const thisMonthStart = startOfMonth(today);
    const thisMonthEnd = endOfMonth(today);
    const lastMonthStart = startOfMonth(subDays(thisMonthStart, 1));
    const lastMonthEnd = endOfMonth(subDays(thisMonthStart, 1));

    let thisMonthCount = 0;
    let lastMonthCount = 0;

    Object.entries(activityData).forEach(([dateStr, count]) => {
      const date = new Date(dateStr);
      if (isWithinInterval(date, { start: thisMonthStart, end: thisMonthEnd })) {
        thisMonthCount += count;
      } else if (isWithinInterval(date, { start: lastMonthStart, end: lastMonthEnd })) {
        lastMonthCount += count;
      }
    });

    const monthlyChange = lastMonthCount > 0 
      ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
      : thisMonthCount > 0 ? 100 : 0;

    return { 
      weeks: weeksArray, 
      months: monthsSet, 
      maxCount: max,
      totalContributions: total,
      weeklyStats: {
        thisWeek: thisWeekCount,
        lastWeek: lastWeekCount,
        change: weeklyChange
      },
      monthlyStats: {
        thisMonth: thisMonthCount,
        lastMonth: lastMonthCount,
        change: monthlyChange
      }
    };
  }, [activityData]);

  const getActivityLevel = (count: number): number => {
    if (count === 0) return 0;
    if (count <= maxCount * 0.25) return 1;
    if (count <= maxCount * 0.5) return 2;
    if (count <= maxCount * 0.75) return 3;
    return 4;
  };

  const getActivityColor = (level: number): string => {
    const colors = [
      "bg-muted/40",           // 0 - no activity
      "bg-success/30",         // 1 - low
      "bg-success/50",         // 2 - medium-low
      "bg-success/70",         // 3 - medium-high
      "bg-success",            // 4 - high
    ];
    return colors[level];
  };

  const TrendIcon = ({ change }: { change: number }) => {
    if (change > 0) return <TrendingUp className="h-3 w-3 text-success" />;
    if (change < 0) return <TrendingDown className="h-3 w-3 text-destructive" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];

  if (loading) {
    return (
      <Card className="p-4 sm:p-6 bg-card/95 minecraft-block">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6 bg-card/95 minecraft-block">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <h2 className="text-base sm:text-xl font-black arcade-text text-primary">
          📅 STUDY ACTIVITY
        </h2>
        <p className="text-xs text-muted-foreground font-bold">
          {totalContributions} topics completed in the last year
        </p>
      </div>

      {/* Weekly & Monthly Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="p-3 bg-muted/40 rounded border border-border">
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">This Week</p>
          <div className="flex items-center gap-2">
            <p className="text-lg font-black text-primary arcade-text">{weeklyStats.thisWeek}</p>
            <div className="flex items-center gap-1">
              <TrendIcon change={weeklyStats.change} />
              <span className={`text-[10px] font-bold ${
                weeklyStats.change > 0 ? "text-success" : 
                weeklyStats.change < 0 ? "text-destructive" : "text-muted-foreground"
              }`}>
                {weeklyStats.change > 0 ? "+" : ""}{weeklyStats.change}%
              </span>
            </div>
          </div>
        </div>
        <div className="p-3 bg-muted/40 rounded border border-border">
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Last Week</p>
          <p className="text-lg font-black text-muted-foreground arcade-text">{weeklyStats.lastWeek}</p>
        </div>
        <div className="p-3 bg-muted/40 rounded border border-border">
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">This Month</p>
          <div className="flex items-center gap-2">
            <p className="text-lg font-black text-secondary arcade-text">{monthlyStats.thisMonth}</p>
            <div className="flex items-center gap-1">
              <TrendIcon change={monthlyStats.change} />
              <span className={`text-[10px] font-bold ${
                monthlyStats.change > 0 ? "text-success" : 
                monthlyStats.change < 0 ? "text-destructive" : "text-muted-foreground"
              }`}>
                {monthlyStats.change > 0 ? "+" : ""}{monthlyStats.change}%
              </span>
            </div>
          </div>
        </div>
        <div className="p-3 bg-muted/40 rounded border border-border">
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Last Month</p>
          <p className="text-lg font-black text-muted-foreground arcade-text">{monthlyStats.lastMonth}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Month labels */}
          <div className="flex mb-1 ml-8">
            {Array.from(months.entries()).map(([weekIndex, month]) => (
              <div
                key={weekIndex}
                className="text-[10px] text-muted-foreground font-bold"
                style={{ 
                  marginLeft: weekIndex === 0 ? 0 : `${(weekIndex - Array.from(months.keys())[Array.from(months.keys()).indexOf(weekIndex) - 1] - 1) * 14}px`,
                  width: "28px"
                }}
              >
                {month}
              </div>
            ))}
          </div>

          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col gap-[3px] mr-2">
              {dayLabels.map((label, index) => (
                <div
                  key={index}
                  className="h-[12px] text-[9px] text-muted-foreground font-bold flex items-center"
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <TooltipProvider delayDuration={0}>
              <div className="flex gap-[3px]">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[3px]">
                    {Array.from({ length: 7 }).map((_, dayIndex) => {
                      const day = week.find((d) => d.getDay() === dayIndex);
                      
                      if (!day) {
                        return (
                          <div
                            key={dayIndex}
                            className="w-[12px] h-[12px]"
                          />
                        );
                      }

                      const dateKey = format(day, "yyyy-MM-dd");
                      const count = activityData[dateKey] || 0;
                      const level = getActivityLevel(count);

                      return (
                        <Tooltip key={dayIndex}>
                          <TooltipTrigger asChild>
                            <div
                              className={`w-[12px] h-[12px] rounded-sm cursor-pointer transition-all hover:scale-125 ${getActivityColor(level)} border border-border/20`}
                            />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            <p className="font-bold">
                              {count} topic{count !== 1 ? "s" : ""} completed
                            </p>
                            <p className="text-muted-foreground">
                              {format(day, "MMM d, yyyy")}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                ))}
              </div>
            </TooltipProvider>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-3">
            <span className="text-[10px] text-muted-foreground font-bold">Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-[12px] h-[12px] rounded-sm ${getActivityColor(level)} border border-border/20`}
              />
            ))}
            <span className="text-[10px] text-muted-foreground font-bold">More</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
