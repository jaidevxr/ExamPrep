import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useProfile } from "@/hooks/useProfile";

interface MusicSource {
  id: string;
  name: string;
  videoId: string;
  type: "preset" | "custom";
}

interface MusicPlayerContextType {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  customSongs: MusicSource[];
  setCustomSongs: (songs: MusicSource[] | ((prev: MusicSource[]) => MusicSource[])) => void;
  selectedSource: string;
  setSelectedSource: (source: string) => void;
  volume: number[];
  setVolume: (volume: number[]) => void;
  muted: boolean;
  setMuted: (muted: boolean) => void;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  duration: number;
  setDuration: (duration: number) => void;
  seekTo: (time: number) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error("useMusicPlayer must be used within MusicPlayerProvider");
  }
  return context;
};

export const MusicPlayerProvider = ({ children }: { children: ReactNode }) => {
  const { profile, updateCustomMusic } = useProfile();
  const [isPlaying, setIsPlaying] = useState(false);
  const [customSongs, setLocalCustomSongs] = useLocalStorage<MusicSource[]>("custom-songs", []);
  const [selectedSource, setSelectedSource] = useLocalStorage("selected-source", "lofi-girl");
  const [volume, setVolume] = useLocalStorage("music-volume", [70]);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seekTime, setSeekTime] = useState<number | null>(null);

  // Sync from profile on load or cross-device update
  useEffect(() => {
    if (profile?.custom_music && Array.isArray(profile.custom_music)) {
      const profileSongsStr = JSON.stringify(profile.custom_music);
      const localSongsStr = JSON.stringify(customSongs);
      if (profileSongsStr !== localSongsStr) {
        setLocalCustomSongs(profile.custom_music);
      }
    }
  }, [profile?.custom_music]);

  // Wrapper to update both local storage and Supabase
  const setCustomSongs = (songs: MusicSource[] | ((prev: MusicSource[]) => MusicSource[])) => {
    const newSongs = typeof songs === 'function' ? songs(customSongs) : songs;
    setLocalCustomSongs(newSongs);
    if (profile) {
      updateCustomMusic(newSongs);
    }
  };

  const seekTo = (time: number) => {
    setSeekTime(time);
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        isPlaying,
        setIsPlaying,
        customSongs,
        setCustomSongs,
        selectedSource,
        setSelectedSource,
        volume,
        setVolume,
        muted,
        setMuted,
        currentTime,
        setCurrentTime,
        duration,
        setDuration,
        seekTo,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};
