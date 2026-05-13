import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const ADMIN_EMAIL = 'jaiy9956@gmail.com';

interface AdminUser {
  id: string;
  username: string | null;
  avatar_url: string | null;
  study_id: string | null;
  last_seen: string | null;
  created_at: string | null;
}

interface AdminStats {
  totalUsers: number;
  activeToday: number;
  totalResources: number;
  totalMessages: number;
}

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, activeToday: 0, totalResources: 0, totalMessages: 0 });
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
        const activeToday = data.filter(u => u.last_seen && new Date(u.last_seen) >= today).length;

        // Get resource count
        let totalResources = 0;
        try {
          const { count } = await supabase.from('resources').select('*', { count: 'exact', head: true });
          totalResources = count || 0;
        } catch {}

        // Get message count
        let totalMessages = 0;
        try {
          const { count } = await supabase.from('direct_messages').select('*', { count: 'exact', head: true });
          totalMessages = count || 0;
        } catch {}

        setStats({
          totalUsers: data.length,
          activeToday,
          totalResources,
          totalMessages,
        });
      }
    } catch (error) {
      console.error('Admin load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!isAdmin) return false;
    try {
      // Delete profile (cascades to friendships, messages via FK)
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;
      setUsers(prev => prev.filter(u => u.id !== userId));
      return true;
    } catch (error) {
      console.error('Delete user error:', error);
      return false;
    }
  };

  const deleteResource = async (resourceId: string) => {
    if (!isAdmin) return false;
    try {
      const { error } = await supabase.from('resources').delete().eq('id', resourceId);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Delete resource error:', error);
      return false;
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  return { isAdmin, users, stats, loading, loadUsers, deleteUser, deleteResource };
};
