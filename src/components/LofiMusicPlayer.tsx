import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Music, Volume2, VolumeX, Radio, Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LofiMusicPlayerProps {
  isPlaying?: boolean;
  onPlayStateChange?: (playing: boolean) => void;
}

interface MusicSource {
  id: string;
  name: string;
  videoId: string;
  type: "preset" | "custom";
}

const defaultMusicSources: MusicSource[] = [
  {
    id: "lofi-girl",
    name: "Lofi Girl - Beats to Study",
    videoId: "jfKfPfyJRdk",
    type: "preset",
  },
  {
    id: "chillhop",
    name: "Chillhop Radio",
    videoId: "5yx6BWlEVcY",
    type: "preset",
  },
  {
    id: "college-music",
    name: "College Music",
    videoId: "lTRiuFIWV54",
    type: "preset",
  },
];

interface CustomSong extends MusicSource {
  type: "custom";
}

const extractYouTubeId = (urlOrQuery: string): string | null => {
  // Check if it's a YouTube URL
  const urlPatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of urlPatterns) {
    const match = urlOrQuery.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

const buildEmbedUrl = (videoId: string, playlistIds: string[], shouldAutoplay: boolean = false) => {
  const base = `https://www.youtube.com/embed/${videoId}`;
  const ids = playlistIds.length ? playlistIds : [videoId];
  const params = new URLSearchParams({
    autoplay: shouldAutoplay ? "1" : "0",
    controls: "0",
    loop: "1",
    playlist: ids.join(","),
  });

  // Optional origin parameter for better compatibility
  if (typeof window !== "undefined" && window.location?.origin) {
    params.set("origin", window.location.origin);
  }

  return `${base}?${params.toString()}`;
};

export const LofiMusicPlayer = ({ isPlaying = false, onPlayStateChange }: LofiMusicPlayerProps) => {
  const [playing, setPlaying] = useState(isPlaying);
  const [volume, setVolume] = useState([70]);
  const [muted, setMuted] = useState(false);
  const [customSongs, setCustomSongs] = useState<CustomSong[]>([]);
  const [selectedSource, setSelectedSource] = useState(defaultMusicSources[0].id);
  const [searchInput, setSearchInput] = useState("");
  const [songName, setSongName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const allSources = [...defaultMusicSources, ...customSongs];
  const currentSource = allSources.find(s => s.id === selectedSource) || defaultMusicSources[0];

  useEffect(() => {
    setPlaying(isPlaying);
  }, [isPlaying]);

  // Reset loading state when source changes
  useEffect(() => {
    if (playing) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
        toast.success(`Now playing: ${currentSource.name}`);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [selectedSource, playing]);

  const togglePlay = () => {
    const newState = !playing;
    setPlaying(newState);
    onPlayStateChange?.(newState);
    
    if (newState) {
      setIsLoading(true);
      toast.info("Loading music...");
    } else {
      setIsLoading(false);
    }
  };

  const toggleMute = () => {
    setMuted(!muted);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value);
  };

  const handleAddSong = () => {
    if (!searchInput.trim()) {
      toast.error("Please enter a YouTube URL or video ID");
      return;
    }

    const videoId = extractYouTubeId(searchInput.trim());
    
    if (!videoId) {
      toast.error("Invalid YouTube URL. Please paste a valid YouTube link or video ID");
      return;
    }

    const name = songName.trim() || `Song ${customSongs.length + 1}`;
    const newSong: CustomSong = {
      id: `custom-${Date.now()}`,
      name,
      videoId,
      type: "custom",
    };
    setCustomSongs([...customSongs, newSong]);
    setSelectedSource(newSong.id);
    setSearchInput("");
    setSongName("");
    toast.success(`Added "${name}" to your playlist!`);
  };

  const handleRemoveSong = (songId: string) => {
    setCustomSongs(customSongs.filter(s => s.id !== songId));
    if (selectedSource === songId) {
      setSelectedSource(defaultMusicSources[0].id);
    }
    toast.success("Song removed from playlist");
  };

  return (
    <Card className="p-4 bg-card/95 minecraft-block transition-all duration-300">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-black arcade-text">STUDY BEATS</h3>
          </div>
          <Button
            onClick={() => setIsMinimized(!isMinimized)}
            size="icon"
            variant="ghost"
            className="h-6 w-6"
          >
            {isMinimized ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div
          className={`relative w-full transition-all duration-300 ${
            isMinimized
              ? "h-0 opacity-0 pointer-events-none -mb-1"
              : "h-52"
          }`}
        >
          <iframe
            ref={iframeRef}
            key={`${currentSource.id}-${playing}`}
            src={buildEmbedUrl(currentSource.videoId, allSources.map((s) => s.videoId), playing)}
            className="w-full h-full border-0 rounded"
            allow="autoplay; encrypted-media"
            title="Music Player"
            onLoad={() => setIsLoading(false)}
          />
          {playing && isLoading && (
            <div className="absolute inset-0 bg-card/95 backdrop-blur-sm flex items-center justify-center rounded">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                <p className="text-xs text-muted-foreground font-black arcade-text">
                  LOADING BEATS...
                </p>
              </div>
            </div>
          )}
        </div>

        {isMinimized ? (
          // Minimized View - Compact Mini Player
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Button
                onClick={togglePlay}
                size="sm"
                variant={playing ? "default" : "outline"}
                className="flex-shrink-0"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : playing ? (
                  <Music className="h-4 w-4 animate-pulse" />
                ) : (
                  <Music className="h-4 w-4" />
                )}
              </Button>

              <div className="flex-1 flex items-center gap-2 min-w-0">
                <Button
                  onClick={toggleMute}
                  size="icon"
                  variant="ghost"
                  className="flex-shrink-0 h-8 w-8"
                  disabled={!playing || isLoading}
                >
                  {muted || volume[0] === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <Slider
                  value={volume}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="flex-1"
                  disabled={!playing || isLoading}
                />
              </div>

              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <div className="text-xs font-bold text-muted-foreground px-2 py-1">Presets</div>
                  {defaultMusicSources.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name}
                    </SelectItem>
                  ))}
                  {customSongs.length > 0 && (
                    <>
                      <div className="text-xs font-bold text-muted-foreground px-2 py-1 mt-2">Your Songs</div>
                      {customSongs.map((song) => (
                        <SelectItem key={song.id} value={song.id}>
                          {song.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {playing && !isLoading && (
              <div className="flex items-center justify-center gap-2 p-1.5 bg-primary/10 rounded border border-primary/20 animate-fade-in">
                <div className="flex gap-1">
                  <div className="w-0.5 h-2 bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
                  <div className="w-0.5 h-2 bg-primary animate-pulse" style={{ animationDelay: '150ms' }} />
                  <div className="w-0.5 h-2 bg-primary animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
                <p className="text-[9px] text-primary font-black arcade-text truncate">
                  {currentSource.name}
                </p>
              </div>
            )}
          </div>
        ) : (
          // Full View - Complete Player
          <>
            <Tabs defaultValue="presets" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="presets">Presets</TabsTrigger>
                <TabsTrigger value="custom">Add Song</TabsTrigger>
              </TabsList>
              
              <TabsContent value="presets" className="space-y-3 mt-3">
                <Select value={selectedSource} onValueChange={setSelectedSource}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="text-xs font-bold text-muted-foreground px-2 py-1">Presets</div>
                    {defaultMusicSources.map((source) => (
                      <SelectItem key={source.id} value={source.id}>
                        {source.name}
                      </SelectItem>
                    ))}
                    {customSongs.length > 0 && (
                      <>
                        <div className="text-xs font-bold text-muted-foreground px-2 py-1 mt-2">Your Songs</div>
                        {customSongs.map((song) => (
                          <SelectItem key={song.id} value={song.id}>
                            <div className="flex items-center justify-between w-full gap-2">
                              <span>{song.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>

                {customSongs.length > 0 && currentSource.type === "custom" && (
                  <Button
                    onClick={() => handleRemoveSong(currentSource.id)}
                    size="sm"
                    variant="destructive"
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove Current Song
                  </Button>
                )}
              </TabsContent>
              
              <TabsContent value="custom" className="space-y-3 mt-3">
                <div className="space-y-2">
                  <Input
                    placeholder="Song name (optional)"
                    value={songName}
                    onChange={(e) => setSongName(e.target.value)}
                    className="w-full"
                  />
                  <Input
                    placeholder="Paste YouTube URL or video ID"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddSong()}
                    className="w-full"
                  />
                  <Button
                    onClick={handleAddSong}
                    size="sm"
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Playlist
                  </Button>
                </div>
                
                <div className="text-[10px] text-muted-foreground space-y-1">
                  <p>💡 Tip: Search for a song on YouTube, copy the URL and paste it here!</p>
                  <p>Example: youtube.com/watch?v=dQw4w9WgXcQ</p>
                </div>
              </TabsContent>
            </Tabs>
            {/* Video iframe is rendered above to keep music playing when minimized */}

            <div className="flex items-center gap-3">
              <Button
                onClick={togglePlay}
                size="sm"
                variant={playing ? "default" : "outline"}
                className="flex-shrink-0"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Loading
                  </>
                ) : playing ? (
                  <>
                    <Music className="h-4 w-4 mr-2 animate-pulse" />
                    Playing
                  </>
                ) : (
                  <>
                    <Music className="h-4 w-4 mr-2" />
                    Play
                  </>
                )}
              </Button>

              <div className="flex-1 flex items-center gap-2">
                <Button
                  onClick={toggleMute}
                  size="icon"
                  variant="ghost"
                  className="flex-shrink-0 h-8 w-8"
                  disabled={!playing || isLoading}
                >
                  {muted || volume[0] === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <Slider
                  value={volume}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="flex-1"
                  disabled={!playing || isLoading}
                />
                <span className="text-xs font-mono text-muted-foreground w-8 text-right">
                  {volume[0]}
                </span>
              </div>
            </div>

            {playing && !isLoading && (
              <div className="flex items-center justify-center gap-2 p-2 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex gap-1">
                  <div className="w-1 h-3 bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-3 bg-primary animate-pulse" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-3 bg-primary animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
                <p className="text-[10px] text-primary font-black arcade-text">
                  {currentSource.name}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};
