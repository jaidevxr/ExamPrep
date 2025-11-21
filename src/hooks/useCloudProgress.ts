import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SubjectProgress {
  [subjectId: string]: {
    [topicId: string]: boolean;
  };
}

export const useCloudProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<SubjectProgress>({});
  const [loading, setLoading] = useState(true);

  // Load progress from cloud
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadProgress = async () => {
      try {
        const { data, error } = await supabase
          .from('study_progress')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        const progressMap: SubjectProgress = {};
        data?.forEach((item) => {
          if (!progressMap[item.subject_id]) {
            progressMap[item.subject_id] = {};
          }
          progressMap[item.subject_id][item.topic_id] = item.completed;
        });

        setProgress(progressMap);
      } catch (error: any) {
        console.error('Error loading progress:', error);
        toast.error('Failed to load progress from cloud');
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [user]);

  // Set up real-time sync
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('study_progress_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_progress',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newData = payload.new as any;
            setProgress((prev) => ({
              ...prev,
              [newData.subject_id]: {
                ...prev[newData.subject_id],
                [newData.topic_id]: newData.completed,
              },
            }));
          } else if (payload.eventType === 'DELETE') {
            const oldData = payload.old as any;
            setProgress((prev) => {
              const newProgress = { ...prev };
              if (newProgress[oldData.subject_id]) {
                delete newProgress[oldData.subject_id][oldData.topic_id];
              }
              return newProgress;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const updateProgress = async (subjectId: string, topicId: string, completed: boolean) => {
    if (!user) {
      toast.error('Please login to save your progress');
      return;
    }

    // Optimistic update
    setProgress((prev) => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        [topicId]: completed,
      },
    }));

    try {
      const { error } = await supabase
        .from('study_progress')
        .upsert(
          {
            user_id: user.id,
            subject_id: subjectId,
            topic_id: topicId,
            completed,
            completed_at: completed ? new Date().toISOString() : null,
          },
          {
            onConflict: 'user_id,subject_id,topic_id',
          }
        );

      if (error) throw error;
    } catch (error: any) {
      console.error('Error updating progress:', error);
      toast.error('Failed to sync progress');
      
      // Revert optimistic update
      setProgress((prev) => ({
        ...prev,
        [subjectId]: {
          ...prev[subjectId],
          [topicId]: !completed,
        },
      }));
    }
  };

  return { progress, updateProgress, loading };
};
