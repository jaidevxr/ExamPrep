import { createContext, useContext, useState, ReactNode } from 'react';
import { FriendProfile } from '@/hooks/useFriends';

interface ChatPopupContextType {
  activeFriend: FriendProfile | null;
  openChat: (friend: FriendProfile) => void;
  closeChat: () => void;
  isOpen: boolean;
}

const ChatPopupContext = createContext<ChatPopupContextType>({
  activeFriend: null,
  openChat: () => {},
  closeChat: () => {},
  isOpen: false,
});

export const useChatPopup = () => useContext(ChatPopupContext);

export const ChatPopupProvider = ({ children }: { children: ReactNode }) => {
  const [activeFriend, setActiveFriend] = useState<FriendProfile | null>(null);

  const openChat = (friend: FriendProfile) => setActiveFriend(friend);
  const closeChat = () => setActiveFriend(null);

  return (
    <ChatPopupContext.Provider value={{ activeFriend, openChat, closeChat, isOpen: !!activeFriend }}>
      {children}
    </ChatPopupContext.Provider>
  );
};
