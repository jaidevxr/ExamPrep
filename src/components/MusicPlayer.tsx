import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Play, Pause, Volume2, VolumeX, Plus, X } from "lucide-react";
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

const extractYouTubeId = (input: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
};

export const MusicPlayer = () => {
  const {
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
    duration,
  } = useMusicPlayer();

  const [songName, setSongName] = useState("");
  const [songUrl, setSongUrl] = useState("");

  const allSources = [...defaultMusicSources, ...customSongs];
  const currentSource = allSources.find((s) => s.id === selectedSource) || defaultMusicSources[0];

  useEffect(() => {
    if (isPlaying) {
      toast.success(`Now playing: ${currentSource.name}`);
    }
  }, [isPlaying, currentSource.name]);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = (value: number[]) => {
    if (value?.[0] && duration > 0) {
      const seekTime = (value[0] / 100) * duration;
      window.dispatchEvent(new CustomEvent("audio-seek", { detail: seekTime }));
    }
  };

  const handleAddSong = () => {
    if (!songUrl.trim()) {
      toast.error("Please enter a YouTube URL or video ID");
      return;
    }

    const videoId = extractYouTubeId(songUrl.trim());
    if (!videoId) {
      toast.error("Invalid YouTube URL or video ID");
      return;
    }

    const name = songName.trim() || `Custom Song ${customSongs.length + 1}`;
    const newSong: MusicSource = {
      id: `custom-${Date.now()}`,
      name,
      videoId,
      type: "custom",
    };

    setCustomSongs([...customSongs, newSong]);
    setSelectedSource(newSong.id);
    setSongName("");
    setSongUrl("");
    toast.success(`Added "${name}" to your playlist!`);
  };

  const handleRemoveSong = (songId: string) => {
    setCustomSongs(customSongs.filter((s) => s.id !== songId));
    if (selectedSource === songId) {
      setSelectedSource(defaultMusicSources[0].id);
    }
    toast.success("Song removed from playlist");
  };

  return (
    <Card className="p-4 bg-card/95 minecraft-block">
      <div className="space-y-4">
        {/* Video Preview - Synced with Audio */}
        <div 
          className="relative w-full h-52 rounded overflow-hidden bg-muted cursor-pointer group"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          <iframe
            key={currentSource.id}
            src={`https://www.youtube.com/embed/${currentSource.videoId}?enablejsapi=1&controls=0&loop=1&playlist=${currentSource.videoId}&mute=1`}
            className="w-full h-full border-0 pointer-events-none"
            allow="autoplay; encrypted-media"
            title="Music Video"
          />
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isPlaying ? 'bg-black/0 group-hover:bg-black/40 opacity-0 group-hover:opacity-100' : 'bg-black/40 opacity-100'}`}>
            <div className="bg-primary/90 rounded-full p-4 transform transition-transform group-hover:scale-110 shadow-lg">
              {isPlaying ? (
                <Pause className="h-8 w-8 text-primary-foreground fill-current" />
              ) : (
                <Play className="h-8 w-8 text-primary-foreground fill-current pl-1" />
              )}
            </div>
          </div>
        </div>

        {/* Now Playing */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-black">
                Study Beats
              </p>
              <p className="text-sm font-black arcade-text truncate">
                {currentSource.name}
              </p>
            </div>
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              size="sm"
              variant={isPlaying ? "default" : "outline"}
              className="gap-2"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span className="font-black arcade-text">PAUSE</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span className="font-black arcade-text">PLAY</span>
                </>
              )}
            </Button>
          </div>

          {/* Seek Bar */}
          <div className="space-y-1">
            <Slider
              value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              disabled={!isPlaying}
            />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setMuted(!muted)}
              size="icon"
              variant="ghost"
              className="h-8 w-8 flex-shrink-0"
            >
              {muted || volume?.[0] === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={volume || [70]}
              onValueChange={setVolume}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs font-mono text-muted-foreground w-8 text-right">
              {volume?.[0] || 70}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="presets">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="custom">Add Song</TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="space-y-3 mt-3">
            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <div className="text-xs font-bold text-muted-foreground px-2 py-1">
                  Presets
                </div>
                {defaultMusicSources.map((source) => (
                  <SelectItem key={source.id} value={source.id}>
                    {source.name}
                  </SelectItem>
                ))}
                {customSongs.length > 0 && (
                  <>
                    <div className="text-xs font-bold text-muted-foreground px-2 py-1 mt-2">
                      Your Songs
                    </div>
                    {customSongs.map((song) => (
                      <SelectItem key={song.id} value={song.id}>
                        {song.name}
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
            <Input
              placeholder="Song name (optional)"
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
            />
            <Input
              placeholder="Paste YouTube URL or video ID"
              value={songUrl}
              onChange={(e) => setSongUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSong()}
            />
            <Button onClick={handleAddSong} size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add to Playlist
            </Button>
            <div className="text-[10px] text-muted-foreground space-y-1">
              <p>💡 Tip: Copy a YouTube URL and paste it here!</p>
              <p>Example: youtube.com/watch?v=dQw4w9WgXcQ</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};
