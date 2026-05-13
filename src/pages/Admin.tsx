import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin, AdminUser, UserProgress, UserMessage, UserFriend } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/AuthContext';
import { subjects } from '@/data/subjects';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft, Users, BarChart3, FileText, Trash2, Search, Shield, Activity,
  MessageSquare, Loader2, RefreshCw, Eye, Edit2, Save, X, UserCheck, ChevronDown, ChevronUp
} from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

// Helper: time since
const timeSince = (d: string | null) => {
  if (!d) return 'Never';
  const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (mins < 1) return 'Now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
};

// Helper: calc progress
const calcUserProgress = (progress: UserProgress) => {
  let done = 0, total = 0;
  subjects.forEach(s => {
    const t = s.units.reduce((a, u) => a + u.topics.filter(x => !x.isHeading).length, 0);
    const c = progress[s.id] ? Object.values(progress[s.id]).filter(Boolean).length : 0;
    done += c; total += t;
  });
  return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
};

// User detail panel
function UserDetail({ u, admin }: { u: AdminUser; admin: ReturnType<typeof useAdmin> }) {
  const [progress, setProgress] = useState<UserProgress>({});
  const [friends, setFriends] = useState<UserFriend[]>([]);
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [tab, setTab] = useState<'progress' | 'friends' | 'messages'>('progress');
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(u.username || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [p, f, m] = await Promise.all([
        admin.getUserProgress(u.id),
        admin.getUserFriends(u.id),
        admin.getUserMessages(u.id),
      ]);
      setProgress(p); setFriends(f); setMessages(m);
      setLoading(false);
    };
    load();
  }, [u.id]);

  const stats = calcUserProgress(progress);

  const handleSave = async () => {
    await admin.updateUserProfile(u.id, { username: editName } as any);
    setEditing(false);
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-4">
      {/* User header */}
      <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
        <Avatar className="h-12 w-12 border-2 border-primary/30">
          <AvatarImage src={u.avatar_url || undefined} />
          <AvatarFallback>{u.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          {editing ? (
            <div className="flex gap-2">
              <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-8 text-sm" />
              <Button size="sm" onClick={handleSave}><Save className="h-3 w-3" /></Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}><X className="h-3 w-3" /></Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="font-bold">{u.username || 'No username'}</p>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => { setEditName(u.username || ''); setEditing(true); }}>
                <Edit2 className="h-3 w-3" />
              </Button>
            </div>
          )}
          <p className="text-[10px] text-muted-foreground">ID: {u.study_id} • Last seen: {timeSince(u.last_seen)}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-primary">{stats.pct}%</p>
          <p className="text-[10px] text-muted-foreground">{stats.done}/{stats.total} topics</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        {(['progress', 'friends', 'messages'] as const).map(t => (
          <Button key={t} size="sm" variant={tab === t ? 'default' : 'outline'} onClick={() => setTab(t)} className="text-[10px] font-bold capitalize">
            {t} {t === 'friends' ? `(${friends.length})` : t === 'messages' ? `(${messages.length})` : ''}
          </Button>
        ))}
      </div>

      {/* Progress tab */}
      {tab === 'progress' && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {subjects.map(s => {
            const total = s.units.reduce((a, u) => a + u.topics.filter(x => !x.isHeading).length, 0);
            const done = progress[s.id] ? Object.values(progress[s.id]).filter(Boolean).length : 0;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <div key={s.id} className="flex items-center gap-2 text-xs">
                <span className="w-28 truncate font-bold">{s.name}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${pct >= 75 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="w-16 text-right text-muted-foreground">{done}/{total}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Friends tab */}
      {tab === 'friends' && (
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {friends.length === 0 ? <p className="text-xs text-muted-foreground text-center py-4">No friends</p> :
            friends.map(f => (
              <div key={f.id} className="flex items-center gap-2 text-xs p-2 bg-muted/30 rounded">
                <UserCheck className="h-3 w-3 text-green-500" />
                <span className="font-bold">{f.username || 'Unknown'}</span>
                <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded ${f.status === 'accepted' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                  {f.status}
                </span>
              </div>
            ))
          }
        </div>
      )}

      {/* Messages tab */}
      {tab === 'messages' && (
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {messages.length === 0 ? <p className="text-xs text-muted-foreground text-center py-4">No messages</p> :
            messages.slice(0, 50).map(m => (
              <div key={m.id} className="flex items-start gap-2 text-xs p-2 bg-muted/30 rounded">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground">
                    <span className="font-bold text-foreground">{m.sender_name}</span> → {m.receiver_name}
                    <span className="ml-2">{new Date(m.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </p>
                  <p className="truncate">{m.content}</p>
                </div>
                <Button size="sm" variant="ghost" className="h-5 w-5 p-0 text-destructive flex-shrink-0" onClick={() => admin.deleteMessage(m.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const admin = useAdmin();
  const { isAdmin, users, stats, loading } = admin;
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'messages'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [allMessages, setAllMessages] = useState<UserMessage[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) { navigate('/'); toast.error('Access denied'); }
  }, [isAdmin, loading]);

  const loadAllMsgs = async () => {
    setLoadingMsgs(true);
    const msgs = await admin.getAllMessages();
    setAllMessages(msgs);
    setLoadingMsgs(false);
  };

  useEffect(() => {
    if (activeTab === 'messages' && isAdmin && allMessages.length === 0) loadAllMsgs();
  }, [activeTab, isAdmin]);

  const filtered = users.filter(u =>
    (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.study_id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background to-secondary/20 pb-24">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-red-500/30 px-4">
        <div className="max-w-6xl mx-auto py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
          <Shield className="h-5 w-5 text-red-500" />
          <h1 className="text-lg font-black arcade-text text-red-500">ADMIN PANEL</h1>
          <Button variant="ghost" size="icon" className="ml-auto" onClick={admin.loadUsers}><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-4 space-y-4">
        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { id: 'dashboard' as const, icon: BarChart3, label: 'Overview' },
            { id: 'users' as const, icon: Users, label: `Users (${stats.totalUsers})` },
            { id: 'messages' as const, icon: MessageSquare, label: `Messages (${stats.totalMessages})` },
          ].map(t => (
            <Button key={t.id} variant={activeTab === t.id ? 'default' : 'outline'} onClick={() => setActiveTab(t.id)} className="font-black arcade-text text-[10px]">
              <t.icon className="h-4 w-4 mr-1" />{t.label}
            </Button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-primary' },
                { label: 'Active Today', value: stats.activeToday, icon: Activity, color: 'text-green-500' },
                { label: 'Active This Week', value: stats.activeThisWeek, icon: Activity, color: 'text-blue-500' },
                { label: 'Total Messages', value: stats.totalMessages, icon: MessageSquare, color: 'text-yellow-500' },
                { label: 'Friendships', value: stats.totalFriendships, icon: UserCheck, color: 'text-pink-500' },
                { label: 'Resources', value: stats.totalResources, icon: FileText, color: 'text-cyan-500' },
              ].map(s => (
                <Card key={s.label} className="p-4 minecraft-block text-center">
                  <s.icon className={`h-7 w-7 mx-auto mb-1 ${s.color}`} />
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-muted-foreground font-bold">{s.label}</p>
                </Card>
              ))}
            </div>
            {/* Recent users */}
            <Card className="p-4 minecraft-block">
              <p className="font-black text-xs mb-3 text-primary">RECENT SIGNUPS</p>
              {users.slice(0, 5).map(u => (
                <div key={u.id} className="flex items-center gap-2 py-1.5 border-b border-border/50 last:border-0 text-xs">
                  <Avatar className="h-6 w-6"><AvatarFallback className="text-[8px]">{u.username?.[0]?.toUpperCase() || '?'}</AvatarFallback></Avatar>
                  <span className="font-bold">{u.username || 'N/A'}</span>
                  <span className="text-muted-foreground ml-auto">{u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}</span>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Search className="h-5 w-5 mt-3 text-muted-foreground" />
              <Input placeholder="Search username or study ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="h-11" />
            </div>
            {filtered.map(u => (
              <Card key={u.id} className="minecraft-block overflow-hidden">
                <div className="p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/20" onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)}>
                  <Avatar className="h-10 w-10 border-2 border-primary/30">
                    <AvatarImage src={u.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-xs font-bold">{u.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{u.username || 'No username'}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{u.study_id || 'No ID'} • Last: {timeSince(u.last_seen)}</p>
                  </div>
                  {expandedUser === u.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {u.id !== user?.id && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={e => e.stopPropagation()}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {u.username}?</AlertDialogTitle>
                          <AlertDialogDescription>Permanently removes this user and all their data.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => admin.deleteUser(u.id)} className="bg-destructive">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                {expandedUser === u.id && (
                  <div className="border-t border-border p-3">
                    <UserDetail u={u} admin={admin} />
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Messages */}
        {activeTab === 'messages' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-muted-foreground">{allMessages.length} messages (latest 200)</p>
              <Button size="sm" variant="outline" onClick={loadAllMsgs}><RefreshCw className="h-3 w-3 mr-1" />Refresh</Button>
            </div>
            {loadingMsgs ? (
              <div className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
            ) : (
              <div className="space-y-1">
                {allMessages.map(m => (
                  <Card key={m.id} className="p-2.5 minecraft-block flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-muted-foreground">
                        <span className="font-bold text-foreground">{m.sender_name}</span>
                        <span className="mx-1">→</span>
                        <span className="font-bold text-foreground">{m.receiver_name}</span>
                        <span className="ml-2">{new Date(m.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        {!m.read && <span className="ml-1 text-yellow-500">● unread</span>}
                      </p>
                      <p className="text-xs mt-0.5">{m.content}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => { admin.deleteMessage(m.id); setAllMessages(prev => prev.filter(x => x.id !== m.id)); }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
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
