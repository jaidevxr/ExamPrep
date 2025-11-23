import { useEffect, useState } from "react";

interface Particle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

export const InteractiveParticles = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const emojis = ['✨', '⭐', '💫', '🌟', '⚡', '🔥'];
    const colors = [
      'hsla(45, 100%, 60%, 0.8)',
      'hsla(280, 85%, 65%, 0.7)',
      'hsla(25, 95%, 55%, 0.6)',
    ];
    
    const initialParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: 16 + Math.random() * 16,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    setParticles(initialParticles);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => {
          let newX = p.x + p.vx;
          let newY = p.y + p.vy;
          let newVx = p.vx;
          let newVy = p.vy;

          // Bounce off walls
          if (newX <= 0 || newX >= window.innerWidth) {
            newVx = -newVx;
            newX = Math.max(0, Math.min(window.innerWidth, newX));
          }
          if (newY <= 0 || newY >= window.innerHeight) {
            newVy = -newVy;
            newY = Math.max(0, Math.min(window.innerHeight, newY));
          }

          // Move away from mouse
          const dx = newX - mousePos.x;
          const dy = newY - mousePos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            const force = (150 - distance) / 150;
            newVx += (dx / distance) * force * 0.5;
            newVy += (dy / distance) * force * 0.5;
          }

          // Damping
          newVx *= 0.99;
          newVy *= 0.99;

          return {
            ...p,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
          };
        })
      );
    }, 16);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mousePos.x, mousePos.y]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute pixelated transition-all duration-100"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            fontSize: `${particle.size}px`,
            filter: `drop-shadow(0 0 8px ${particle.color})`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {particle.emoji}
        </div>
      ))}
    </div>
  );
};
