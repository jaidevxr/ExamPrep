import { useState, useEffect } from "react";
import { ArcadeNavbar } from "@/components/ArcadeNavbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChat } from "@/hooks/useChat";
import { useFriends } from "@/hooks/useFriends";
import { useAuth } from "@/contexts/AuthContext";
import { useChatPopup } from "@/contexts/ChatPopupContext";
import {
  ArrowLeft,
  MessageSquare,
  Loader2,
  Check,
  CheckCheck,
  Search,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const Messages = () => {
  const navigate = useNavigate();
  const { friendId } = useParams<{ friendId?: string }>();
  const { user } = useAuth();
  const { friends } = useFriends();
  const { openChat } = useChatPopup();
  const {
    threads,
    loadingThreads,
    totalUnread,
  } = useChat();

  const [searchQuery, setSearchQuery] = useState("");

  // If navigated with friendId, open the chat popup and go back to thread list
  useEffect(() => {
    if (friendId) {
      const friendData = friends.find((f) => f.friend.id === friendId)?.friend;
      if (friendData) {
        openChat(friendData);
        navigate("/messages", { replace: true });
      }
    }
  }, [friendId, friends]);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getOnlineStatus = (lastSeen: string | null) => {
    if (!lastSeen) return { label: "Offline", isOnline: false };
    const diffMs = Date.now() - new Date(lastSeen).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 5) return { label: "Online", isOnline: true };
    return { label: "", isOnline: false };
  };

  const filteredThreads = threads.filter((t) =>
    !searchQuery || t.friend.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <ArcadeNavbar />
      <div className="min-h-screen w-full pb-24 px-4 pt-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/friends")}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-black arcade-text text-primary flex items-center gap-2">
                💬 Messages
              </h1>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                Chat with study buddies
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="pl-10 h-10 border-2 bg-muted/30 font-medium text-sm"
            />
          </div>

          {/* Threads */}
          {loadingThreads ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <p className="font-black text-sm text-muted-foreground">
                {friends.length === 0 ? "Add friends to start chatting" : "No conversations yet"}
              </p>
              <p className="text-xs text-muted-foreground/60">
                {friends.length === 0
                  ? "Go to Buddies and add some friends first!"
                  : "Tap a friend below to start a conversation"}
              </p>
            </div>
          ) : (
            <Card className="bg-card/95 minecraft-block divide-y divide-border overflow-hidden">
              {filteredThreads.map((thread) => {
                const status = getOnlineStatus(thread.friend.last_seen);
                const lastMsg = thread.lastMessage;
                const isLastMine = lastMsg?.sender_id === user?.id;

                return (
                  <button
                    key={thread.friend.id}
                    onClick={() => openChat(thread.friend)}
                    className="w-full flex items-center gap-3 p-3.5 hover:bg-muted/30 transition-colors text-left"
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-12 w-12 border-2 border-border">
                        <AvatarImage src={thread.friend.avatar_url || undefined} />
                        <AvatarFallback className="bg-muted font-black">
                          {thread.friend.username?.[0]?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      {status.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-card" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-black text-sm truncate">{thread.friend.username || "Unknown"}</p>
                        {lastMsg && (
                          <span className={`text-[10px] flex-shrink-0 ml-2 ${
                            thread.unreadCount > 0 ? "text-primary font-black" : "text-muted-foreground"
                          }`}>
                            {formatTime(lastMsg.created_at)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className={`text-xs truncate flex-1 ${
                          thread.unreadCount > 0 ? "text-foreground font-bold" : "text-muted-foreground"
                        }`}>
                          {lastMsg ? (
                            <>
                              {isLastMine && (
                                <span className="inline-flex items-center mr-1">
                                  {lastMsg.read ? (
                                    <CheckCheck className="h-3 w-3 text-blue-400 inline" />
                                  ) : (
                                    <Check className="h-3 w-3 text-muted-foreground inline" />
                                  )}
                                </span>
                              )}
                              {lastMsg.content.length > 40
                                ? lastMsg.content.substring(0, 40) + "..."
                                : lastMsg.content}
                            </>
                          ) : (
                            <span className="text-muted-foreground/50 italic">No messages yet</span>
                          )}
                        </p>
                        {thread.unreadCount > 0 && (
                          <span className="ml-2 flex-shrink-0 bg-primary text-primary-foreground text-[10px] font-black rounded-full h-5 min-w-5 flex items-center justify-center px-1.5">
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default Messages;
