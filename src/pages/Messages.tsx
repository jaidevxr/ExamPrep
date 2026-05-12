import { useState, useEffect, useRef } from "react";
import { ArcadeNavbar } from "@/components/ArcadeNavbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChat, ChatThread } from "@/hooks/useChat";
import { useFriends, FriendProfile } from "@/hooks/useFriends";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Send,
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
  const {
    threads,
    messages,
    loadingThreads,
    loadingMessages,
    totalUnread,
    loadMessages,
    sendMessage,
    setActiveFriendId,
  } = useChat();

  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Active friend from URL param
  const activeFriend = friendId
    ? friends.find((f) => f.friend.id === friendId)?.friend || null
    : null;

  // Load messages when friend changes
  useEffect(() => {
    if (friendId) {
      loadMessages(friendId);
    } else {
      setActiveFriendId(null);
    }
  }, [friendId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (friendId) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [friendId]);

  const handleSend = async () => {
    if (!messageText.trim() || !friendId || sending) return;
    setSending(true);
    const text = messageText;
    setMessageText("");
    await sendMessage(friendId, text);
    setSending(false);
    inputRef.current?.focus();
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const getOnlineStatus = (lastSeen: string | null) => {
    if (!lastSeen) return { label: "Offline", isOnline: false };
    const diffMs = Date.now() - new Date(lastSeen).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 5) return { label: "Online", isOnline: true };
    if (diffMins < 60) return { label: `${diffMins}m ago`, isOnline: false };
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) return { label: `${diffHours}h ago`, isOnline: false };
    return { label: `${Math.floor(diffMs / 86400000)}d ago`, isOnline: false };
  };

  // Group messages by date
  const groupedMessages = messages.reduce<{ date: string; msgs: typeof messages }[]>((groups, msg) => {
    const dateKey = formatDate(msg.created_at);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.date === dateKey) {
      lastGroup.msgs.push(msg);
    } else {
      groups.push({ date: dateKey, msgs: [msg] });
    }
    return groups;
  }, []);

  const filteredThreads = threads.filter((t) =>
    !searchQuery || t.friend.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // === CHAT VIEW (when friendId is set) ===
  if (friendId && activeFriend) {
    const status = getOnlineStatus(activeFriend.last_seen);

    return (
      <>
        <div className="min-h-screen w-full flex flex-col bg-background" style={{ paddingBottom: 0 }}>
          {/* Chat Header */}
          <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b-2 border-border px-3 py-2.5">
            <div className="flex items-center gap-3 max-w-4xl mx-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/messages")}
                className="h-9 w-9 flex-shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-9 w-9 border-2 border-border flex-shrink-0">
                <AvatarImage src={activeFriend.avatar_url || undefined} />
                <AvatarFallback className="bg-muted font-black text-sm">
                  {activeFriend.username?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-black text-sm truncate">{activeFriend.username}</p>
                <p className={`text-[10px] ${status.isOnline ? "text-green-400" : "text-muted-foreground"}`}>
                  {status.label}
                </p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div
            className="flex-1 overflow-y-auto px-3 py-4 space-y-1"
            style={{ maxHeight: "calc(100vh - 120px)" }}
          >
            {loadingMessages ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground font-bold">No messages yet</p>
                <p className="text-xs text-muted-foreground/60">
                  Say hi to {activeFriend.username}! 👋
                </p>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-1">
                {groupedMessages.map((group) => (
                  <div key={group.date}>
                    {/* Date divider */}
                    <div className="flex items-center justify-center py-3">
                      <span className="px-3 py-1 rounded-full bg-muted/60 text-[10px] font-bold text-muted-foreground">
                        {group.date}
                      </span>
                    </div>
                    {/* Messages */}
                    {group.msgs.map((msg, idx) => {
                      const isMe = msg.sender_id === user?.id;
                      const prevMsg = idx > 0 ? group.msgs[idx - 1] : null;
                      const sameSender = prevMsg?.sender_id === msg.sender_id;
                      const timeDiff = prevMsg
                        ? (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime()) / 60000
                        : 999;
                      const showTail = !sameSender || timeDiff > 2;

                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"} ${showTail ? "mt-2" : "mt-0.5"}`}
                        >
                          <div
                            className={`relative max-w-[75%] px-3 py-1.5 ${
                              isMe
                                ? "bg-primary/90 text-primary-foreground rounded-l-xl rounded-tr-xl" +
                                  (showTail ? " rounded-br-sm" : " rounded-br-xl")
                                : "bg-muted/80 text-foreground rounded-r-xl rounded-tl-xl" +
                                  (showTail ? " rounded-bl-sm" : " rounded-bl-xl")
                            }`}
                          >
                            <p className="text-[13px] leading-relaxed break-words whitespace-pre-wrap">
                              {msg.content}
                            </p>
                            <div className={`flex items-center gap-1 mt-0.5 ${isMe ? "justify-end" : "justify-start"}`}>
                              <span className="text-[9px] opacity-60">{formatTime(msg.created_at)}</span>
                              {isMe && (
                                msg.read ? (
                                  <CheckCheck className="h-3 w-3 text-blue-300" />
                                ) : (
                                  <Check className="h-3 w-3 opacity-60" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="sticky bottom-0 bg-card/95 backdrop-blur-sm border-t-2 border-border px-3 py-2.5">
            <div className="flex items-center gap-2 max-w-4xl mx-auto">
              <Input
                ref={inputRef}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Type a message..."
                className="flex-1 h-10 border-2 bg-muted/30 font-medium text-sm"
                disabled={sending}
              />
              <Button
                onClick={handleSend}
                disabled={!messageText.trim() || sending}
                size="icon"
                className="h-10 w-10 rounded-full flex-shrink-0"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // === THREAD LIST VIEW ===
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
              onClick={() => navigate("/")}
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
                    onClick={() => navigate(`/messages/${thread.friend.id}`)}
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
