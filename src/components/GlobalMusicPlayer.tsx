import { useEffect, useRef, useState } from "react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";

interface MusicSource {
  id: string;
  name: string;
  videoId: string;
  type: "preset" | "custom";
}

const defaultMusicSources: MusicSource[] = [
  { id: "lofi-girl", name: "Lofi Girl - Beats to Study", videoId: "jfKfPfyJRdk", type: "preset" },
  { id: "chillhop", name: "Chillhop Radio", videoId: "5yx6BWlEVcY", type: "preset" },
  { id: "college-music", name: "College Music", videoId: "lTRiuFIWV54", type: "preset" },
];

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const GlobalMusicPlayer = () => {
  const {
    isPlaying,
    customSongs,
    selectedSource,
    volume,
    muted,
    setCurrentTime,
    setDuration,
  } = useMusicPlayer();

  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const updateIntervalRef = useRef<number>();
  const [playerReady, setPlayerReady] = useState(false);

  const allSources = [...defaultMusicSources, ...customSongs];
  const currentSource = allSources.find((s) => s.id === selectedSource) || defaultMusicSources[0];

  // Load YouTube API
  useEffect(() => {
    if (window.YT?.Player) return;

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }, []);

  // Initialize player when source changes
  useEffect(() => {
    const initPlayer = () => {
      if (!window.YT?.Player || !containerRef.current) {
        setTimeout(initPlayer, 100);
        return;
      }

      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
      }

      setPlayerReady(false);

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: currentSource.videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          loop: 1,
          playlist: currentSource.videoId,
          enablejsapi: 1,
        },
        events: {
          onReady: (e: any) => {
            const dur = e.target.getDuration();
            setDuration(dur > 0 ? dur : 3600);
            
            if (volume?.[0] && e.target.setVolume) e.target.setVolume(volume[0]);
            if (muted && e.target.mute) e.target.mute();
            
            setPlayerReady(true);
            
            // Sync with visual player
            window.dispatchEvent(new CustomEvent('player-ready', { detail: currentSource.videoId }));
          },
          onStateChange: (e: any) => {
            if (e.data === window.YT.PlayerState.ENDED) {
              e.target.playVideo();
            }
            // Sync play/pause state with visual player
            if (e.data === window.YT.PlayerState.PLAYING) {
              window.dispatchEvent(new CustomEvent('player-playing', { detail: currentSource.videoId }));
            } else if (e.data === window.YT.PlayerState.PAUSED) {
              window.dispatchEvent(new CustomEvent('player-paused', { detail: currentSource.videoId }));
            }
          },
        },
      });
    };

    initPlayer();
    return () => {
      if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
    };
  }, [currentSource.videoId]);

  // Play/pause control
  useEffect(() => {
    if (!playerReady || !playerRef.current?.playVideo || !playerRef.current?.pauseVideo) return;

    if (isPlaying) {
      playerRef.current.playVideo();
      updateIntervalRef.current = window.setInterval(() => {
        if (playerRef.current?.getCurrentTime) {
          setCurrentTime(playerRef.current.getCurrentTime());
        }
      }, 500);
    } else {
      playerRef.current.pauseVideo();
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = undefined;
      }
    }
  }, [isPlaying, playerReady, setCurrentTime]);

  // Volume control
  useEffect(() => {
    if (!playerReady || !playerRef.current?.setVolume || !volume?.[0]) return;
    playerRef.current.setVolume(volume[0]);
  }, [volume, playerReady]);

  // Mute control
  useEffect(() => {
    if (!playerReady || !playerRef.current) return;
    
    try {
      if (muted && playerRef.current.mute) {
        playerRef.current.mute();
      } else if (!muted && playerRef.current.unMute) {
        playerRef.current.unMute();
      }
    } catch (e) {
      console.error('Mute control error:', e);
    }
  }, [muted, playerReady]);

  // Seek control
  useEffect(() => {
    const handleSeek = (e: CustomEvent<number>) => {
      if (playerReady && playerRef.current?.seekTo) {
        playerRef.current.seekTo(e.detail, true);
        setCurrentTime(e.detail);
      }
    };

    window.addEventListener("audio-seek" as any, handleSeek);
    return () => window.removeEventListener("audio-seek" as any, handleSeek);
  }, [playerReady, setCurrentTime]);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "1px", height: "1px", opacity: 0, pointerEvents: "none" }}>
      <div ref={containerRef} />
    </div>
  );
};
