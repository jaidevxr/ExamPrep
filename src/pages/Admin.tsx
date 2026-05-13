import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft, Users, BarChart3, FileText, Trash2, Search, Shield,
  Activity, MessageSquare, Upload, Loader2, RefreshCw, Eye
} from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface Resource {
  id: string;
  subject_id: string;
  title: string;
  type: string;
  file_url: string;
  year: string | null;
  description: string | null;
  created_at: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, users, stats, loading, loadUsers, deleteUser, deleteResource } = useAdmin();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'content'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
      toast.error('Access denied');
    }
  }, [isAdmin, loading, navigate]);

  const loadResources = async () => {
    setLoadingResources(true);
    try {
      const { data } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });
      setResources(data || []);
    } catch {}
    setLoadingResources(false);
  };

  useEffect(() => {
    if (activeTab === 'content' && isAdmin) loadResources();
  }, [activeTab, isAdmin]);

  const filteredUsers = users.filter(u =>
    (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.study_id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteUser = async (userId: string, username: string | null) => {
    const success = await deleteUser(userId);
    if (success) {
      toast.success(`Deleted user ${username || 'unknown'}`);
    } else {
      toast.error('Failed to delete user');
    }
  };

  const handleDeleteResource = async (id: string) => {
    const success = await deleteResource(id);
    if (success) {
      toast.success('Resource deleted');
      loadResources();
    } else {
      toast.error('Failed to delete');
    }
  };

  const getTimeSince = (date: string | null) => {
    if (!date) return 'Never';
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const tabs = [
    { id: 'dashboard' as const, icon: BarChart3, label: 'Overview' },
    { id: 'users' as const, icon: Users, label: 'Users' },
    { id: 'content' as const, icon: FileText, label: 'Content' },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background to-secondary/20 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4">
        <div className="max-w-6xl mx-auto py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Shield className="h-5 w-5 text-red-500" />
          <h1 className="text-lg font-black arcade-text text-red-500">ADMIN PANEL</h1>
          <Button variant="ghost" size="icon" className="ml-auto" onClick={loadUsers}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id)}
              className="font-black arcade-text text-xs"
            >
              <tab.icon className="h-4 w-4 mr-1" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 minecraft-block text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-black text-primary">{stats.totalUsers}</p>
              <p className="text-xs text-muted-foreground font-bold mt-1">Total Users</p>
            </Card>
            <Card className="p-5 minecraft-block text-center">
              <Activity className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-3xl font-black text-green-500">{stats.activeToday}</p>
              <p className="text-xs text-muted-foreground font-bold mt-1">Active Today</p>
            </Card>
            <Card className="p-5 minecraft-block text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="text-3xl font-black text-blue-500">{stats.totalResources}</p>
              <p className="text-xs text-muted-foreground font-bold mt-1">Resources</p>
            </Card>
            <Card className="p-5 minecraft-block text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-3xl font-black text-yellow-500">{stats.totalMessages}</p>
              <p className="text-xs text-muted-foreground font-bold mt-1">Messages</p>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Search className="h-5 w-5 mt-3 text-muted-foreground" />
              <Input
                placeholder="Search by username or study ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11"
              />
            </div>
            <p className="text-xs text-muted-foreground font-bold">{filteredUsers.length} users</p>
            <div className="space-y-2">
              {filteredUsers.map((u) => (
                <Card key={u.id} className="p-3 minecraft-block flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-primary/30">
                    <AvatarImage src={u.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-xs font-bold">
                      {u.username?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{u.username || 'No username'}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{u.study_id || 'No ID'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] text-muted-foreground">{getTimeSince(u.last_seen)}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Joined {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  {u.id !== user?.id && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="minecraft-block">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {u.username}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove this user and all their data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteUser(u.id, u.username)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-bold">{resources.length} resources</p>
              <Button onClick={() => navigate('/resources')} className="font-black arcade-text text-xs">
                <Upload className="h-4 w-4 mr-1" /> Manage Resources
              </Button>
            </div>
            {loadingResources ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : resources.length === 0 ? (
              <Card className="p-8 minecraft-block text-center">
                <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-bold text-muted-foreground">No resources uploaded yet</p>
                <p className="text-xs text-muted-foreground mt-1">Go to Resources page to upload PYQs and Notes</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {resources.map((r) => (
                  <Card key={r.id} className="p-3 minecraft-block flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{r.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {r.type.toUpperCase()} • {r.subject_id} {r.year ? `• ${r.year}` : ''}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(r.file_url, '_blank')}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive h-8 w-8">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="minecraft-block">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{r.title}"?</AlertDialogTitle>
                            <AlertDialogDescription>This resource will be permanently removed.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteResource(r.id)} className="bg-destructive">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
