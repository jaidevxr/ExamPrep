import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ADMIN_EMAIL = 'jaiy9956@gmail.com';

export interface Resource {
  id: string;
  subject_id: string;
  title: string;
  type: 'pyq' | 'notes';
  file_url: string;
  uploaded_by: string | null;
  year: string | null;
  description: string | null;
  created_at: string;
}

export const useResources = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const isAdmin = user?.email === ADMIN_EMAIL;

  const loadResources = async (subjectFilter?: string, typeFilter?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (subjectFilter && subjectFilter !== 'all') {
        query = query.eq('subject_id', subjectFilter);
      }
      if (typeFilter && typeFilter !== 'all') {
        query = query.eq('type', typeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setResources((data as Resource[]) || []);
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadResource = async (
    file: File,
    title: string,
    subjectId: string,
    type: 'pyq' | 'notes',
    year?: string,
    description?: string
  ) => {
    if (!user || !isAdmin) {
      toast.error('Only admin can upload resources');
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10MB');
      return false;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `resources/${type}/${subjectId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('pyq-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('pyq-files')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from('resources')
        .insert({
          subject_id: subjectId,
          title,
          type,
          file_url: publicUrl,
          uploaded_by: user.id,
          year: year || null,
          description: description || null,
        });

      if (insertError) throw insertError;

      toast.success('Resource uploaded!');
      await loadResources();
      return true;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload: ' + error.message);
      return false;
    } finally {
      setUploading(false);
    }
  };

  const deleteResource = async (id: string) => {
    if (!isAdmin) return false;
    try {
      const { error } = await supabase.from('resources').delete().eq('id', id);
      if (error) throw error;
      setResources(prev => prev.filter(r => r.id !== id));
      toast.success('Resource deleted');
      return true;
    } catch {
      toast.error('Failed to delete');
      return false;
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  return { resources, loading, uploading, isAdmin, loadResources, uploadResource, deleteResource };
};
