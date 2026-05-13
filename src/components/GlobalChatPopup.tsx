import { useState, useEffect, useRef } from 'react';
import { useChatPopup } from '@/contexts/ChatPopupContext';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft, Send, MessageSquare, Loader2, Check, CheckCheck,
  Maximize2, Minimize2, X,
} from 'lucide-react';

export const GlobalChatPopup = () => {
  const { activeFriend, closeChat, isOpen } = useChatPopup();
  const { user } = useAuth();
  const { messages, loadingMessages, loadMessages, sendMessage } = useChat();
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeFriend) {
      loadMessages(activeFriend.id);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [activeFriend]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen || !activeFriend) return null;

  const handleSend = async () => {
    if (!messageText.trim() || sending) return;
    setSending(true);
    const text = messageText;
    setMessageText('');
    await sendMessage(activeFriend.id, text);
    setSending(false);
    inputRef.current?.focus();
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getOnlineStatus = (lastSeen: string | null) => {
    if (!lastSeen) return { label: 'Offline', isOnline: false };
    const diffMs = Date.now() - new Date(lastSeen).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 5) return { label: 'Online', isOnline: true };
    if (diffMins < 60) return { label: `${diffMins}m ago`, isOnline: false };
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) return { label: `${diffHours}h ago`, isOnline: false };
    return { label: `${Math.floor(diffMs / 86400000)}d ago`, isOnline: false };
  };

  const status = getOnlineStatus(activeFriend.last_seen);

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

  return (
    <div className={`fixed z-40 flex flex-col bg-card border-2 border-border shadow-2xl overflow-hidden transition-all duration-300 ${
      isMaximized
        ? 'inset-0 rounded-none z-[60]'
        : 'bottom-[76px] right-2 left-2 sm:left-auto sm:right-4 sm:w-[380px] h-[60vh] max-h-[500px] rounded-xl'
    }`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/50 flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={closeChat} className="h-7 w-7 flex-shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="h-7 w-7 border border-border flex-shrink-0">
          <AvatarImage src={activeFriend.avatar_url || undefined} />
          <AvatarFallback className="bg-muted font-black text-[10px]">
            {activeFriend.username?.[0]?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="font-black text-xs truncate">{activeFriend.username}</p>
          <p className={`text-[9px] ${status.isOnline ? 'text-green-400' : 'text-muted-foreground'}`}>
            {status.label}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMaximized(!isMaximized)} className="h-7 w-7">
          {isMaximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={closeChat} className="h-7 w-7">
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {loadingMessages ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground font-bold">No messages yet</p>
            <p className="text-[10px] text-muted-foreground/60">Say hi to {activeFriend.username}! 👋</p>
          </div>
        ) : (
          <div className="space-y-1">
            {groupedMessages.map((group) => (
              <div key={group.date}>
                <div className="flex items-center justify-center py-2">
                  <span className="px-2 py-0.5 rounded-full bg-muted/60 text-[9px] font-bold text-muted-foreground">
                    {group.date}
                  </span>
                </div>
                {group.msgs.map((msg, idx) => {
                  const isMe = msg.sender_id === user?.id;
                  const prevMsg = idx > 0 ? group.msgs[idx - 1] : null;
                  const sameSender = prevMsg?.sender_id === msg.sender_id;
                  const timeDiff = prevMsg
                    ? (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime()) / 60000
                    : 999;
                  const showTail = !sameSender || timeDiff > 2;

                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${showTail ? 'mt-1.5' : 'mt-0.5'}`}>
                      <div className={`relative max-w-[80%] px-2.5 py-1 ${
                        isMe
                          ? 'bg-primary/90 text-primary-foreground rounded-l-xl rounded-tr-xl' + (showTail ? ' rounded-br-sm' : ' rounded-br-xl')
                          : 'bg-muted/80 text-foreground rounded-r-xl rounded-tl-xl' + (showTail ? ' rounded-bl-sm' : ' rounded-bl-xl')
                      }`}>
                        <p className="text-[12px] leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
                        <div className={`flex items-center gap-1 mt-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-[8px] opacity-60">{formatTime(msg.created_at)}</span>
                          {isMe && (msg.read ? <CheckCheck className="h-2.5 w-2.5 text-blue-300" /> : <Check className="h-2.5 w-2.5 opacity-60" />)}
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

      {/* Input */}
      <div className="border-t bg-muted/30 px-2 py-2 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <Input
            ref={inputRef}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            className="flex-1 h-8 border bg-background font-medium text-xs"
            disabled={sending}
          />
          <Button onClick={handleSend} disabled={!messageText.trim() || sending} size="icon" className="h-8 w-8 rounded-full flex-shrink-0">
            {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};
