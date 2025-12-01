import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useStudyStreak = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const calculateStreak = (completedDates: Date[]): number => {
    if (completedDates.length === 0) return 0;

    // Sort dates in descending order
    const sortedDates = completedDates
      .map(date => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
      })
      .sort((a, b) => b.getTime() - a.getTime());

    // Remove duplicates (same day)
    const uniqueDates = sortedDates.filter((date, index, array) => {
      if (index === 0) return true;
      return date.getTime() !== array[index - 1].getTime();
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if most recent study was today or yesterday
    const mostRecentStudy = uniqueDates[0];
    if (mostRecentStudy.getTime() !== today.getTime() && 
        mostRecentStudy.getTime() !== yesterday.getTime()) {
      return 0; // Streak broken
    }

    // Count consecutive days
    let streakCount = 1;
    let currentDate = new Date(mostRecentStudy);

    for (let i = 1; i < uniqueDates.length; i++) {
      const previousDay = new Date(currentDate);
      previousDay.setDate(previousDay.getDate() - 1);

      if (uniqueDates[i].getTime() === previousDay.getTime()) {
        streakCount++;
        currentDate = uniqueDates[i];
      } else {
        break;
      }
    }

    return streakCount;
  };

  const fetchStreak = async () => {
    if (!user) {
      setStreak(0);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('study_progress')
        .select('completed_at')
        .eq('user_id', user.id)
        .eq('completed', true)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      const completedDates = data
        .map(item => item.completed_at)
        .filter(date => date !== null)
        .map(date => new Date(date));

      const calculatedStreak = calculateStreak(completedDates);
      setStreak(calculatedStreak);
    } catch (error) {
      console.error('Error calculating streak:', error);
      setStreak(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreak();
  }, [user]);

  // Set up real-time updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('streak_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_progress',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchStreak();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { streak, loading };
};
