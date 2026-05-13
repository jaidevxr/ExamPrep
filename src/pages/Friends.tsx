import { useState, useEffect, useRef } from "react";
import { ArcadeNavbar } from "@/components/ArcadeNavbar";
import { ProgressComparison } from "@/components/ProgressComparison";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFriends, FriendProfile, Friendship, FriendProgress } from "@/hooks/useFriends";
import { useChat } from "@/hooks/useChat";
import { useChatPopup } from "@/contexts/ChatPopupContext";
import { subjects } from "@/data/subjects";
import {
  Users,
  UserPlus,
  Search,
  Copy,
  Check,
  X,
  Clock,
  Loader2,
  BarChart3,
  ArrowLeft,
  Share2,
  MoreVertical,
  UserMinus,
  MessageSquare,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const Friends = () => {
  const navigate = useNavigate();
  const {
    friends,
    pendingRequests,
    sentRequests,
    loading,
    myStudyId,
    searchUser,
    sendRequest,
    acceptRequest,
    removeFriend,
    getFriendProgress,
    calculateSubjectProgress,
  } = useFriends();
  const { openChat } = useChatPopup();
  const { threads, onlineUsers } = useChat();

  const [searchId, setSearchId] = useState("");
  const [searchResult, setSearchResult] = useState<FriendProfile | null>(null);
  const [searching, setSearching] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<FriendProfile | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [friendProgressCache, setFriendProgressCache] = useState<Record<string, FriendProgress>>({});
  const [friendProgressLoading, setFriendProgressLoading] = useState<Record<string, boolean>>({});
  const loadedFriendIds = useRef(new Set<string>());

  // Load friend progress when friends list changes
  useEffect(() => {
    if (!friends || friends.length === 0) return;

    const fetchAllProgress = async () => {
      const newFriends = friends.filter(f => !loadedFriendIds.current.has(f.friend.id));
      if (newFriends.length === 0) return;

      const newFids = newFriends.map(f => f.friend.id);
      newFids.forEach(id => loadedFriendIds.current.add(id));

      setFriendProgressLoading(prev => {
        const next = { ...prev };
        newFids.forEach(id => { next[id] = true; });
        return next;
      });

      const promises = newFids.map(id => getFriendProgress(id).then(prog => ({ id, prog })));
      const results = await Promise.all(promises);

      setFriendProgressCache(prev => {
        const next = { ...prev };
        results.forEach(res => { next[res.id] = res.prog; });
        return next;
      });

      setFriendProgressLoading(prev => {
        const next = { ...prev };
        newFids.forEach(id => { next[id] = false; });
        return next;
      });
    };

    fetchAllProgress();
  }, [friends, getFriendProgress]);

  // Auto-search from share link (?add=STUDY_ID)
  useEffect(() => {
    const addId = searchParams.get("add");
    if (addId && addId.length >= 3 && !loading) {
      setSearchId(addId.toUpperCase());
      // Clear the param so it doesn't re-trigger
      setSearchParams({}, { replace: true });
      // Auto-search after a brief delay for UX
      const timer = setTimeout(async () => {
        setSearching(true);
        setSearchResult(null);
        const result = await searchUser(addId);
        setSearchResult(result);
        setSearching(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchParams, loading]);

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setSearching(true);
    setSearchResult(null);
    const result = await searchUser(searchId);
    setSearchResult(result);
    setSearching(false);
  };

  const handleSendRequest = async (userId: string) => {
    setSendingRequest(true);
    await sendRequest(userId);
    setSearchResult(null);
    setSearchId("");
    setSendingRequest(false);
  };

  const handleCopyId = () => {
    if (myStudyId) {
      navigator.clipboard.writeText(myStudyId);
      setCopied(true);
      toast.success("Study ID copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareLink = () => {
    if (myStudyId) {
      const shareUrl = `${window.location.origin}/friends?add=${myStudyId}`;
      navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      toast.success("Share link copied!");
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const getOnlineStatus = (lastSeen: string | null, userId: string) => {
    if (onlineUsers[userId]) return { status: "online", label: "Online", color: "bg-green-500" };
    if (!lastSeen) return { status: "offline", label: "Offline", color: "bg-muted-foreground/50" };

    const now = new Date();
    const seen = new Date(lastSeen);
    const diffMs = now.getTime() - seen.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 5) return { status: "away", label: "Just now", color: "bg-yellow-500" };
    if (diffMins < 60) return { status: "away", label: `${diffMins}m ago`, color: "bg-yellow-500" };
    if (diffHours < 24) return { status: "away", label: `${diffHours}h ago`, color: "bg-yellow-500" };
    return { status: "offline", label: `${diffDays}d ago`, color: "bg-muted-foreground/50" };
  };



  if (loading) {
    return (
      <>
        <ArcadeNavbar />
        <div className="min-h-screen w-full flex items-center justify-center pb-24">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground font-bold">Loading friends...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ArcadeNavbar />
      <div className="min-h-screen w-full relative pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 relative z-10 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black arcade-text text-primary">
                👥 STUDY BUDDIES
              </h1>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                Compare Progress & Compete
              </p>
            </div>
          </div>

          {/* Your Study ID */}
          <Card className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 minecraft-block border-primary/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-black">
                  Your Study ID
                </p>
                <p className="text-2xl font-black arcade-text text-primary tracking-[0.3em]">
                  {myStudyId || "Loading..."}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Share this with friends so they can add you
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyId}
                  className="font-black arcade-text border-2 border-primary/30 h-10 px-3 sm:px-4 text-xs"
                  disabled={!myStudyId}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" /> COPIED
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" /> COPY ID
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShareLink}
                  className="font-black arcade-text border-2 border-secondary/30 h-10 px-3 sm:px-4 text-xs"
                  disabled={!myStudyId}
                >
                  {linkCopied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" /> COPIED
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4 mr-1" /> SHARE
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Add Friend */}
          <Card className="p-4 bg-card/95 minecraft-block">
            <div className="flex items-center gap-2 mb-3">
              <UserPlus className="h-4 w-4 text-success" />
              <h2 className="text-sm font-black arcade-text uppercase tracking-wider">Add Friend</h2>
            </div>
            <div className="flex gap-2">
              <Input
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Username or Study ID"
                className="h-11 font-bold tracking-wider"
                maxLength={20}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button
                onClick={handleSearch}
                disabled={searching || searchId.length < 3}
                className="h-11 font-black arcade-text border-2 px-6"
              >
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-1" /> FIND
                  </>
                )}
              </Button>
            </div>

            {/* Search Result */}
            {searchResult && (
              <div className="mt-3 p-3 bg-muted/40 rounded border-2 border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-success">
                    <AvatarImage src={searchResult.avatar_url || undefined} />
                    <AvatarFallback className="bg-success/20 font-black">
                      {searchResult.username?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-black text-sm">{searchResult.username || "Unknown"}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      ID: {searchResult.study_id}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleSendRequest(searchResult.id)}
                  disabled={sendingRequest}
                  className="font-black arcade-text text-xs h-9"
                  size="sm"
                >
                  {sendingRequest ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="h-3 w-3 mr-1" /> ADD
                    </>
                  )}
                </Button>
              </div>
            )}
          </Card>

          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <Card className="p-4 bg-card/95 minecraft-block">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-warning" />
                <h2 className="text-sm font-black arcade-text uppercase tracking-wider">
                  Pending Requests ({pendingRequests.length})
                </h2>
              </div>
              <div className="space-y-2">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 bg-warning/5 rounded border-2 border-warning/20"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border-2 border-warning/30">
                        <AvatarImage src={request.friend.avatar_url || undefined} />
                        <AvatarFallback className="bg-warning/20 font-black text-xs">
                          {request.friend.username?.[0]?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-black text-sm">{request.friend.username || "Unknown"}</p>
                        <p className="text-[9px] text-muted-foreground">wants to be study buddies</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => acceptRequest(request.id)}
                        className="h-8 font-black text-xs bg-success hover:bg-success/90"
                      >
                        <Check className="h-3 w-3 mr-1" /> ACCEPT
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeFriend(request.id)}
                        className="h-8 font-black text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Sent Requests */}
          {sentRequests.length > 0 && (
            <Card className="p-4 bg-card/95 minecraft-block">
              <div className="flex items-center gap-2 mb-3">
                <UserPlus className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-black arcade-text uppercase tracking-wider text-muted-foreground">
                  Sent Requests ({sentRequests.length})
                </h2>
              </div>
              <div className="space-y-2">
                {sentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 bg-muted/20 rounded border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-border">
                        <AvatarImage src={request.friend.avatar_url || undefined} />
                        <AvatarFallback className="bg-muted font-black text-xs">
                          {request.friend.username?.[0]?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-black text-sm">{request.friend.username || "Unknown"}</p>
                        <p className="text-[9px] text-muted-foreground">Pending acceptance...</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFriend(request.id)}
                      className="h-8 text-xs text-muted-foreground hover:text-destructive"
                    >
                      Cancel
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Friends List with Progress */}
          <Card className="p-4 bg-card/95 minecraft-block">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-black arcade-text uppercase tracking-wider">
                  Friends ({friends.length})
                </h2>
              </div>
            </div>

            {friends.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/30" />
                <div>
                  <p className="font-black text-sm text-muted-foreground">No friends yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Share your Study ID or search for friends above
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {friends.map((friendship) => {
                  const online = getOnlineStatus(friendship.friend.last_seen, friendship.friend.id);
                  const friendProg = friendProgressCache[friendship.friend.id];
                  const friendProgLoading = !friendProg && friendProgressLoading[friendship.friend.id];
                  const friendThread = threads.find(t => t.friend.id === friendship.friend.id);
                  const unreadCount = friendThread?.unreadCount || 0;

                  return (
                    <div
                      key={friendship.id}
                      className="p-3 bg-muted/20 rounded border-2 border-border hover:bg-muted/30 transition-colors space-y-3"
                    >
                      {/* Friend header row */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="relative flex-shrink-0">
                            <Avatar className="h-10 w-10 border-2 border-border">
                              <AvatarImage src={friendship.friend.avatar_url || undefined} />
                              <AvatarFallback className="bg-muted font-black">
                                {friendship.friend.username?.[0]?.toUpperCase() || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card ${online.color}`}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-sm truncate">{friendship.friend.username || "Unknown"}</p>
                            <div className="flex items-center gap-1.5">
                              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">
                                {online.label}
                              </p>
                              <span className="text-[9px] text-muted-foreground">•</span>
                              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">
                                {friendship.friend.study_id}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            size="sm"
                            variant={unreadCount > 0 ? "default" : "outline"}
                            onClick={() => openChat(friendship.friend)}
                            className="relative h-8 sm:h-9 font-black arcade-text text-[10px] sm:text-xs border-2 px-2 sm:px-3"
                          >
                            {unreadCount > 0 && (
                              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] text-destructive-foreground font-black border-2 border-card animate-pulse">
                                {unreadCount > 9 ? '9+' : unreadCount}
                              </span>
                            )}
                            <MessageSquare className="h-3 w-3 sm:mr-1" />
                            <span className="hidden sm:inline">CHAT</span>
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedFriend(friendship.friend);
                              setCompareOpen(true);
                            }}
                            className="h-8 sm:h-9 font-black arcade-text text-[10px] sm:text-xs border-2 px-2 sm:px-3"
                          >
                            <BarChart3 className="h-3 w-3 sm:mr-1" />
                            <span className="hidden sm:inline">COMPARE</span>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 sm:h-9 w-8 sm:w-9 p-0 text-muted-foreground"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="minecraft-block border-2">
                              <DropdownMenuItem
                                onClick={() => removeFriend(friendship.id)}
                                className="text-destructive focus:text-destructive font-bold text-xs gap-2 cursor-pointer"
                              >
                                <UserMinus className="h-3.5 w-3.5" />
                                Remove Friend
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Subject progress bars */}
                      {friendProgLoading ? (
                        <div className="flex items-center justify-center py-2">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground ml-2">Loading progress...</span>
                        </div>
                      ) : friendProg ? (
                        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                          {subjects.map((subject) => {
                            const pct = calculateSubjectProgress(subject.id, friendProg);
                            return (
                              <div key={subject.id} className="space-y-0.5">
                                <div className="flex items-center justify-between">
                                  <p className="text-[9px] font-bold text-muted-foreground truncate pr-1">
                                    {subject.code}
                                  </p>
                                  <p className="text-[9px] font-black text-primary">{pct}%</p>
                                </div>
                                <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-700 ease-out"
                                    style={{
                                      width: `${pct}%`,
                                      background: pct > 70 ? "hsl(var(--success))" : pct > 30 ? "hsl(var(--primary))" : "hsl(var(--warning))",
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Comparison Dialog */}
      {selectedFriend && (
        <ProgressComparison
          open={compareOpen}
          onOpenChange={setCompareOpen}
          friend={selectedFriend}
        />
      )}
    </>
  );
};

export default Friends;
