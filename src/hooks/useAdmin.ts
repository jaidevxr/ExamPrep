import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ADMIN_EMAIL = 'jaiy9956@gmail.com';

export interface AdminUser {
  id: string;
  username: string | null;
  avatar_url: string | null;
  study_id: string | null;
  last_seen: string | null;
  created_at: string | null;
  default_focus_duration: number | null;
  default_break_duration: number | null;
}

export interface AdminStats {
  totalUsers: number;
  activeToday: number;
  activeThisWeek: number;
  totalResources: number;
  totalMessages: number;
  totalFriendships: number;
}

export interface UserProgress {
  [subjectId: string]: { [topicId: string]: boolean };
}

export interface UserFriend {
  id: string;
  username: string | null;
  status: string;
}

export interface UserMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender_name?: string;
  receiver_name?: string;
}

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0, activeToday: 0, activeThisWeek: 0,
    totalResources: 0, totalMessages: 0, totalFriendships: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  }, [user]);

  const loadUsers = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setUsers(data);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const activeToday = data.filter(u => u.last_seen && new Date(u.last_seen) >= today).length;
        const activeThisWeek = data.filter(u => u.last_seen && new Date(u.last_seen) >= weekAgo).length;

        let totalResources = 0;
        try {
          const { count } = await supabase.from('resources').select('*', { count: 'exact', head: true });
          totalResources = count || 0;
        } catch {}

        let totalMessages = 0;
        try {
          const { count } = await supabase.from('direct_messages').select('*', { count: 'exact', head: true });
          totalMessages = count || 0;
        } catch {}

        let totalFriendships = 0;
        try {
          const { count } = await supabase.from('friendships').select('*', { count: 'exact', head: true });
          totalFriendships = count || 0;
        } catch {}

        setStats({ totalUsers: data.length, activeToday, activeThisWeek, totalResources, totalMessages, totalFriendships });
      }
    } catch (error) {
      console.error('Admin load error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get a specific user's study progress
  const getUserProgress = async (userId: string): Promise<UserProgress> => {
    if (!isAdmin) return {};
    try {
      const { data } = await supabase
        .from('study_progress')
        .select('*')
        .eq('user_id', userId);
      if (!data) return {};
      const progress: UserProgress = {};
      data.forEach((row: any) => {
        if (!progress[row.subject_id]) progress[row.subject_id] = {};
        progress[row.subject_id][row.topic_id] = row.completed;
      });
      return progress;
    } catch {
      return {};
    }
  };

  // Get a specific user's friends
  const getUserFriends = async (userId: string): Promise<UserFriend[]> => {
    if (!isAdmin) return [];
    try {
      const { data } = await supabase
        .from('friendships')
        .select('*, user1:profiles!friendships_requester_id_fkey(*), user2:profiles!friendships_addressee_id_fkey(*)')
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
      if (!data) return [];
      return data.map((f: any) => {
        const friend = f.requester_id === userId ? f.user2 : f.user1;
        return { id: friend?.id || '', username: friend?.username || null, status: f.status };
      });
    } catch {
      return [];
    }
  };

  // Get a specific user's messages
  const getUserMessages = async (userId: string): Promise<UserMessage[]> => {
    if (!isAdmin) return [];
    try {
      const { data } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(100);
      if (!data) return [];

      // Attach usernames
      const userIds = [...new Set(data.flatMap((m: any) => [m.sender_id, m.receiver_id]))];
      const { data: profiles } = await supabase.from('profiles').select('id, username').in('id', userIds);
      const nameMap = new Map((profiles || []).map((p: any) => [p.id, p.username || 'Unknown']));

      return data.map((m: any) => ({
        ...m,
        sender_name: nameMap.get(m.sender_id) || 'Unknown',
        receiver_name: nameMap.get(m.receiver_id) || 'Unknown',
      }));
    } catch {
      return [];
    }
  };

  // Get all messages in the system
  const getAllMessages = async (): Promise<UserMessage[]> => {
    if (!isAdmin) return [];
    try {
      const { data } = await supabase
        .from('direct_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (!data) return [];
      const userIds = [...new Set(data.flatMap((m: any) => [m.sender_id, m.receiver_id]))];
      const { data: profiles } = await supabase.from('profiles').select('id, username').in('id', userIds);
      const nameMap = new Map((profiles || []).map((p: any) => [p.id, p.username || 'Unknown']));
      return data.map((m: any) => ({
        ...m,
        sender_name: nameMap.get(m.sender_id) || 'Unknown',
        receiver_name: nameMap.get(m.receiver_id) || 'Unknown',
      }));
    } catch {
      return [];
    }
  };

  // Update any user's profile (uses SECURITY DEFINER function to bypass RLS)
  const updateUserProfile = async (userId: string, updates: Partial<AdminUser>) => {
    if (!isAdmin) return false;
    try {
      const { error } = await supabase.rpc('admin_update_profile', {
        target_user_id: userId,
        new_username: updates.username ?? null,
      });
      if (error) throw error;
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
      toast.success('User updated');
      return true;
    } catch (error: any) {
      toast.error('Update failed: ' + error.message);
      return false;
    }
  };

  // Delete a user
  const deleteUser = async (userId: string) => {
    if (!isAdmin) return false;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('User deleted');
      return true;
    } catch (error: any) {
      toast.error('Delete failed: ' + error.message);
      return false;
    }
  };

  // Delete a specific message
  const deleteMessage = async (messageId: string) => {
    if (!isAdmin) return false;
    try {
      const { error } = await supabase.from('direct_messages').delete().eq('id', messageId);
      if (error) throw error;
      toast.success('Message deleted');
      return true;
    } catch {
      toast.error('Delete failed');
      return false;
    }
  };

  // Delete a resource
  const deleteResource = async (resourceId: string) => {
    if (!isAdmin) return false;
    try {
      const { error } = await supabase.from('resources').delete().eq('id', resourceId);
      if (error) throw error;
      toast.success('Resource deleted');
      return true;
    } catch {
      toast.error('Delete failed');
      return false;
    }
  };

  useEffect(() => {
    if (isAdmin) loadUsers();
  }, [isAdmin]);

  return {
    isAdmin, users, stats, loading, loadUsers,
    getUserProgress, getUserFriends, getUserMessages, getAllMessages,
    updateUserProfile, deleteUser, deleteMessage, deleteResource,
  };
};
