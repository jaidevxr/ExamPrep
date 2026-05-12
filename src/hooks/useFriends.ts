import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { subjects } from '@/data/subjects';

export interface FriendProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  study_id: string | null;
  last_seen: string | null;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string | null;
  friend: FriendProfile;
}

export interface FriendProgress {
  [subjectId: string]: {
    [topicId: string]: boolean;
  };
}

export const useFriends = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [sentRequests, setSentRequests] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [myStudyId, setMyStudyId] = useState<string | null>(null);

  // Load my study ID
  useEffect(() => {
    if (!user) return;

    const loadStudyId = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('study_id')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setMyStudyId(data.study_id);
      }
    };

    loadStudyId();
  }, [user]);

  // Load all friendships
  const loadFriendships = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select('*')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (error) throw error;

      if (!friendships || friendships.length === 0) {
        setFriends([]);
        setPendingRequests([]);
        setSentRequests([]);
        setLoading(false);
        return;
      }

      // Get all unique user IDs we need profiles for
      const userIds = new Set<string>();
      friendships.forEach(f => {
        if (f.requester_id !== user.id) userIds.add(f.requester_id);
        if (f.addressee_id !== user.id) userIds.add(f.addressee_id);
      });

      // Fetch profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, study_id, last_seen')
        .in('id', Array.from(userIds));

      if (profileError) throw profileError;

      const profileMap = new Map<string, FriendProfile>();
      profiles?.forEach(p => profileMap.set(p.id, p));

      // Categorize friendships
      const accepted: Friendship[] = [];
      const pending: Friendship[] = [];
      const sent: Friendship[] = [];

      friendships.forEach(f => {
        const friendId = f.requester_id === user.id ? f.addressee_id : f.requester_id;
        const friendProfile = profileMap.get(friendId);

        if (!friendProfile) return;

        const friendship: Friendship = {
          ...f,
          friend: friendProfile,
        };

        if (f.status === 'accepted') {
          accepted.push(friendship);
        } else if (f.status === 'pending') {
          if (f.addressee_id === user.id) {
            pending.push(friendship);
          } else {
            sent.push(friendship);
          }
        }
      });

      setFriends(accepted);
      setPendingRequests(pending);
      setSentRequests(sent);
    } catch (error: any) {
      console.error('Error loading friendships:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFriendships();
  }, [loadFriendships]);

  // Real-time subscription for friendship changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('friendship_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
        },
        () => {
          // Reload all friendships on any change
          loadFriendships();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadFriendships]);

  // Search user by study ID
  const searchByStudyId = async (studyId: string): Promise<FriendProfile | null> => {
    if (!user) return null;

    const normalizedId = studyId.toUpperCase().trim();

    if (normalizedId === myStudyId) {
      toast.error("That's your own Study ID!");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, study_id, last_seen')
        .eq('study_id', normalizedId)
        .single();

      if (error || !data) {
        toast.error('No user found with that Study ID');
        return null;
      }

      return data;
    } catch (error) {
      toast.error('No user found with that Study ID');
      return null;
    }
  };

  // Send friend request
  const sendRequest = async (addresseeId: string) => {
    if (!user) return false;

    try {
      // Check if friendship already exists
      const { data: existing } = await supabase
        .from('friendships')
        .select('id, status')
        .or(
          `and(requester_id.eq.${user.id},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${user.id})`
        );

      if (existing && existing.length > 0) {
        const status = existing[0].status;
        if (status === 'accepted') {
          toast.info('You are already friends!');
        } else if (status === 'pending') {
          toast.info('Friend request already sent!');
        }
        return false;
      }

      const { error } = await supabase
        .from('friendships')
        .insert({
          requester_id: user.id,
          addressee_id: addresseeId,
          status: 'pending',
        });

      if (error) throw error;

      toast.success('Friend request sent!');
      await loadFriendships();
      return true;
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
      return false;
    }
  };

  // Accept friend request
  const acceptRequest = async (friendshipId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', friendshipId);

      if (error) throw error;

      toast.success('Friend request accepted!');
      await loadFriendships();
      return true;
    } catch (error: any) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request');
      return false;
    }
  };

  // Reject/remove friend
  const removeFriend = async (friendshipId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      toast.success('Removed successfully');
      await loadFriendships();
      return true;
    } catch (error: any) {
      console.error('Error removing friend:', error);
      toast.error('Failed to remove');
      return false;
    }
  };

  // Get friend's progress
  const getFriendProgress = async (friendUserId: string): Promise<FriendProgress> => {
    if (!user) return {};

    try {
      const { data, error } = await supabase.rpc('get_friend_progress', {
        friend_user_id: friendUserId,
      });

      if (error) throw error;

      const progressMap: FriendProgress = {};
      (data as any[])?.forEach((item: { subject_id: string; topic_id: string; completed: boolean }) => {
        if (!progressMap[item.subject_id]) {
          progressMap[item.subject_id] = {};
        }
        progressMap[item.subject_id][item.topic_id] = item.completed;
      });

      return progressMap;
    } catch (error: any) {
      console.error('Error fetching friend progress:', error);
      return {};
    }
  };

  // Calculate progress percentage for a given progress map
  const calculateSubjectProgress = (subjectId: string, progressData: FriendProgress) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return 0;

    const totalTopics = subject.units.reduce(
      (acc, unit) => acc + unit.topics.filter(t => !t.isHeading).length,
      0
    );
    const completedTopics = subject.units.reduce((acc, unit) => {
      return acc + unit.topics.filter(
        t => !t.isHeading && progressData[subjectId]?.[t.id] === true
      ).length;
    }, 0);

    return totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  };

  // Update last seen
  const updateLastSeen = useCallback(async () => {
    if (!user) return;
    try {
      await supabase.rpc('update_last_seen');
    } catch (error) {
      // Silently fail - not critical
    }
  }, [user]);

  // Update last seen periodically
  useEffect(() => {
    if (!user) return;

    updateLastSeen();
    const interval = setInterval(updateLastSeen, 60000); // Every minute

    return () => clearInterval(interval);
  }, [user, updateLastSeen]);

  return {
    friends,
    pendingRequests,
    sentRequests,
    loading,
    myStudyId,
    searchByStudyId,
    sendRequest,
    acceptRequest,
    removeFriend,
    getFriendProgress,
    calculateSubjectProgress,
    reload: loadFriendships,
  };
};
