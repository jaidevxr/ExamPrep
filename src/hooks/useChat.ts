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
  const channelRef = useRef<any>(null);

  // Load all chat threads (conversations with friends)
  const loadThreads = useCallback(async () => {
    if (!user || friends.length === 0) {
      setLoadingThreads(false);
      return;
    }

    try {
      // Get all DMs involving this user
      const { data: allMessages, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by friend
      const threadMap = new Map<string, { lastMsg: DirectMessage; unread: number }>();

      (allMessages || []).forEach((msg: any) => {
        const friendId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!threadMap.has(friendId)) {
          threadMap.set(friendId, { lastMsg: msg, unread: 0 });
        }
        if (msg.receiver_id === user.id && !msg.read) {
          const entry = threadMap.get(friendId)!;
          entry.unread++;
        }
      });

      // Build threads from friends list
      const chatThreads: ChatThread[] = friends
        .map((f) => {
          const thread = threadMap.get(f.friend.id);
          return {
            friend: f.friend,
            friendshipId: f.id,
            lastMessage: thread?.lastMsg || null,
            unreadCount: thread?.unread || 0,
          };
        })
        .sort((a, b) => {
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

      // Mark unread messages as read
      await supabase
        .from('direct_messages')
        .update({ read: true })
        .eq('sender_id', friendId)
        .eq('receiver_id', user.id)
        .eq('read', false);

      // Update thread unread count locally
      setThreads((prev) =>
        prev.map((t) => (t.friend.id === friendId ? { ...t, unreadCount: 0 } : t))
      );
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  }, [user]);

  // Send a message
  const sendMessage = useCallback(async (receiverId: string, content: string) => {
    if (!user || !content.trim()) return false;

    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content: content.trim(),
        })
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
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Total unread count (for badge)
  const totalUnread = threads.reduce((acc, t) => acc + t.unreadCount, 0);

  return {
    threads,
    messages,
    loadingThreads,
    loadingMessages,
    totalUnread,
    loadMessages,
    sendMessage,
    setActiveFriendId,
    reload: loadThreads,
  };
};
