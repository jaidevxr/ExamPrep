import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  default_focus_duration: number | null;
  default_break_duration: number | null;
  created_at: string | null;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error: any) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          setProfile(payload.new as Profile);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const updateUsername = async (username: string) => {
    if (!user) {
      toast.error('Please login to update your profile');
      return false;
    }

    if (username.length < 3 || username.length > 20) {
      toast.error('Username must be 3-20 characters');
      return false;
    }

    const optimisticProfile = profile ? { ...profile, username } : null;
    setProfile(optimisticProfile);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Username updated');
      return true;
    } catch (error: any) {
      console.error('Error updating username:', error);
      toast.error('Failed to update username');
      setProfile(profile);
      return false;
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) {
      toast.error('Please login to upload an avatar');
      return false;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return false;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPG, PNG, and WebP formats are supported');
      return false;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('pyq-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('pyq-files')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile((prev) => prev ? { ...prev, avatar_url: publicUrl } : null);
      toast.success('Avatar updated');
      return true;
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
      return false;
    } finally {
      setUploading(false);
    }
  };

  const updatePreferences = async (focusDuration: number, breakDuration: number) => {
    if (!user) {
      toast.error('Please login to update preferences');
      return false;
    }

    const optimisticProfile = profile
      ? { ...profile, default_focus_duration: focusDuration, default_break_duration: breakDuration }
      : null;
    setProfile(optimisticProfile);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          default_focus_duration: focusDuration,
          default_break_duration: breakDuration,
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Preferences updated');
      return true;
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
      setProfile(profile);
      return false;
    }
  };

  return {
    profile,
    loading,
    uploading,
    updateUsername,
    uploadAvatar,
    updatePreferences,
  };
};
