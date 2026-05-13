import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFriends, FriendProfile, Friendship } from './useFriends';
import { usePushNotifications } from './usePushNotifications';

export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  reply_to: string | null;
}

export interface ChatThread {
  friend: FriendProfile;
  friendshipId: string;
  lastMessage: DirectMessage | null;
  unreadCount: number;
}

export const useChat = () => {
  const { user } = useAuth();
  const { friends } = useFriends();
  const { sendNotification } = usePushNotifications();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [activeFriendId, setActiveFriendId] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const channelRef = useRef<any>(null);
  const presenceChannelRef = useRef<any>(null);
  const activeFriendIdRef = useRef<string | null>(null);

  // Sync active friend ID to ref for realtime callback
  useEffect(() => {
    activeFriendIdRef.current = activeFriendId;
  }, [activeFriendId]);

  // Load all chat threads (conversations with friends)
  const loadThreads = useCallback(async () => {
    if (!user || friends.length === 0) {
      setLoadingThreads(false);
      return;
    }

    try {
      // Build threads from friends list
      const chatThreads: ChatThread[] = await Promise.all(
        friends.map(async (f) => {
          const friendId = f.friend.id;

          // Fetch the single most recent message for this thread
          const { data: lastMsgData } = await supabase
            .from('direct_messages')
            .select('*')
            .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`)
            .order('created_at', { ascending: false })
            .limit(1);

          // Fetch unread count
          const { count: unreadCount } = await supabase
            .from('direct_messages')
            .select('*', { count: 'exact', head: true })
            .eq('sender_id', friendId)
            .eq('receiver_id', user.id)
            .eq('read', false);

          return {
            friend: f.friend,
            friendshipId: f.id,
            lastMessage: lastMsgData && lastMsgData.length > 0 ? (lastMsgData[0] as DirectMessage) : null,
            unreadCount: unreadCount || 0,
          };
        })
      );

      // Sort by latest message
      chatThreads.sort((a, b) => {
        if (!a.lastMessage && !b.lastMessage) return 0;
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime();
      });

      setThreads(chatThreads);
    } catch (error) {
      console.error('Error loading threads:', error);
    } finally {
      setLoadingThreads(false);
    }
  }, [user, friends]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  // Load messages for a specific friend
  const loadMessages = useCallback(async (friendId: string) => {
    if (!user) return;
    setLoadingMessages(true);
    setActiveFriendId(friendId);

    // Optimistically update thread unread count locally so badge clears instantly
    setThreads((prev) =>
      prev.map((t) => (t.friend.id === friendId ? { ...t, unreadCount: 0 } : t))
    );

    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data as DirectMessage[]) || []);

      // Mark unread messages as read in backend
      await supabase
        .from('direct_messages')
        .update({ read: true })
        .eq('sender_id', friendId)
        .eq('receiver_id', user.id)
        .eq('read', false);

    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  }, [user]);

  // Send a message
  const sendMessage = useCallback(async (receiverId: string, content: string, replyToId?: string) => {
    if (!user || !content.trim()) return false;

    try {
      const insertData: any = {
        sender_id: user.id,
        receiver_id: receiverId,
        content: content.trim(),
      };
      if (replyToId) insertData.reply_to = replyToId;

      const { data, error } = await supabase
        .from('direct_messages')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      // Add to local messages
      setMessages((prev) => [...prev, data as DirectMessage]);
      // Update thread
      setThreads((prev) =>
        prev.map((t) =>
          t.friend.id === receiverId ? { ...t, lastMessage: data as DirectMessage } : t
        )
      );

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }, [user]);

  const activeFriendIdRef = useRef(activeFriendId);
  const threadsRef = useRef(threads);

  useEffect(() => {
    activeFriendIdRef.current = activeFriendId;
  }, [activeFriendId]);

  useEffect(() => {
    threadsRef.current = threads;
  }, [threads]);

  // Realtime subscription for new messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('dm_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
        },
        (payload: any) => {
          const newMsg = payload.new as DirectMessage;

          // Only process messages relevant to this user
          if (newMsg.sender_id !== user.id && newMsg.receiver_id !== user.id) return;

          const friendId = newMsg.sender_id === user.id ? newMsg.receiver_id : newMsg.sender_id;
          const currentActiveId = activeFriendIdRef.current;

          // If we're in the active chat, add the message
          if (friendId === currentActiveId && newMsg.sender_id !== user.id) {
            setMessages((prev) => {
              if (prev.find((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
            // Mark as read immediately
            supabase
              .from('direct_messages')
              .update({ read: true })
              .eq('id', newMsg.id)
              .then();
          } else if (newMsg.sender_id !== user.id) {
            // Not in active chat — send browser push notification
            const senderThread = threadsRef.current.find(t => t.friend.id === newMsg.sender_id);
            const senderName = senderThread?.friend.username || 'Someone';
            sendNotification(
              `${senderName} sent a message`,
              newMsg.content.length > 50 ? newMsg.content.slice(0, 50) + '...' : newMsg.content
            );
          }

          // Update threads
          setThreads((prev) => {
            const existing = prev.find((t) => t.friend.id === friendId);
            if (existing) {
              return prev
                .map((t) =>
                  t.friend.id === friendId
                    ? {
                        ...t,
                        lastMessage: newMsg,
                        unreadCount:
                          friendId === activeFriendIdRef.current ? 0 : t.unreadCount + (newMsg.sender_id !== user.id ? 1 : 0),
                      }
                    : t
                )
                .sort((a, b) => {
                  if (!a.lastMessage && !b.lastMessage) return 0;
                  if (!a.lastMessage) return 1;
                  if (!b.lastMessage) return -1;
                  return new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime();
                });
            } else {
              // Fetch user dynamically if not in threads
              supabase.from('profiles').select('*').eq('id', friendId).single().then(({ data: friendData }) => {
                if (friendData) {
                  setThreads(currentThreads => {
                    if (currentThreads.some(t => t.friend.id === friendId)) return currentThreads;
                    return [{
                      friend: friendData,
                      lastMessage: newMsg,
                      unreadCount: newMsg.sender_id !== user.id ? 1 : 0
                    }, ...currentThreads].sort((a, b) => {
                      if (!a.lastMessage && !b.lastMessage) return 0;
                      if (!a.lastMessage) return 1;
                      if (!b.lastMessage) return -1;
                      return new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime();
                    });
                  });
                }
              });
            }
            return prev;
          });
        }
      )
      .subscribe();

    // Presence subscription
    presenceChannel.current = supabase.channel('online_users');
    presenceChannel.current
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.current.presenceState();
        const newOnline: Record<string, boolean> = {};
        const newTyping: Record<string, boolean> = {};
        
        Object.values(state).forEach((presences: any) => {
          presences.forEach((p: any) => {
            newOnline[p.user_id] = true;
            if (p.typing) newTyping[p.user_id] = true;
          });
        });
        
        setOnlineUsers(newOnline);
        setTypingUsers(newTyping);
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED' && user) {
          await presenceChannel.current.track({
            user_id: user.id,
            typing: false
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
      if (presenceChannel.current) {
        supabase.removeChannel(presenceChannel.current);
      }
    };
  }, [user]);

  const setTyping = useCallback(async (isTyping: boolean) => {
    if (presenceChannel.current && user) {
      await presenceChannel.current.track({
        user_id: user.id,
        typing: isTyping
      });
    }
  }, [user]);

  // Total unread count (for badge)
  const totalUnread = threads.reduce((acc, t) => acc + t.unreadCount, 0);

  return {
    threads,
    messages,
    loadingThreads,
    loadingMessages,
    totalUnread,
    onlineUsers,
    typingUsers,
    loadMessages,
    sendMessage,
    setActiveFriendId,
    setTyping,
    reload: loadThreads,
  };
};
