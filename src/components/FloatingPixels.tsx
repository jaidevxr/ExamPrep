import { useEffect, useState } from "react";

interface Pixel {
  id: number;
  emoji: string;
  left: number;
  top: number;
  duration: number;
  delay: number;
  size: number;
}

export const FloatingPixels = () => {
  const [pixels, setPixels] = useState<Pixel[]>([]);

  useEffect(() => {
    const emojis = ['🚀', '🪐', '🌟', '⭐', '✨', '🌙', '☄️', '🛸', '👾', '🎮', '💫', '🌠'];
    
    const newPixels = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 15 + Math.random() * 25,
      delay: Math.random() * 5,
      size: 24 + Math.random() * 24,
    }));

    setPixels(newPixels);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {pixels.map((pixel) => (
        <div
          key={pixel.id}
          className="absolute pixelated animate-float"
          style={{
            left: `${pixel.left}%`,
            top: `${pixel.top}%`,
            fontSize: `${pixel.size}px`,
            animation: `float ${pixel.duration}s ease-in-out infinite`,
            animationDelay: `${pixel.delay}s`,
            filter: 'drop-shadow(0 0 12px hsla(45, 100%, 60%, 0.6))',
          }}
        >
          {pixel.emoji}
        </div>
      ))}
    </div>
  );
};
