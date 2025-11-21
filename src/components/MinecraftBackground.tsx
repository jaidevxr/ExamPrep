import { useEffect, useState, useRef } from "react";

interface Block {
  id: number;
  x: number;
  y: number;
  size: number;
  type: 'grass' | 'dirt' | 'stone' | 'diamond';
  velocityX: number;
  velocityY: number;
  rotation: number;
}

const blockColors = {
  grass: 'bg-gradient-to-b from-green-600 to-green-800',
  dirt: 'bg-gradient-to-b from-amber-700 to-amber-900',
  stone: 'bg-gradient-to-b from-gray-500 to-gray-700',
  diamond: 'bg-gradient-to-b from-cyan-400 to-cyan-600'
};

export const MinecraftBackground = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const blockTypes: Array<'grass' | 'dirt' | 'stone' | 'diamond'> = ['grass', 'dirt', 'stone', 'diamond'];
    
    const initialBlocks = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 40 + Math.random() * 40,
      type: blockTypes[Math.floor(Math.random() * blockTypes.length)],
      velocityX: (Math.random() - 0.5) * 0.3,
      velocityY: (Math.random() - 0.5) * 0.3,
      rotation: Math.random() * 360
    }));

    setBlocks(initialBlocks);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlocks(prevBlocks =>
        prevBlocks.map(block => {
          let newX = block.x + block.velocityX;
          let newY = block.y + block.velocityY;
          let newVelocityX = block.velocityX;
          let newVelocityY = block.velocityY;

          // Bounce off walls
          if (newX <= 0 || newX >= 100) {
            newVelocityX = -newVelocityX;
            newX = Math.max(0, Math.min(100, newX));
          }
          if (newY <= 0 || newY >= 100) {
            newVelocityY = -newVelocityY;
            newY = Math.max(0, Math.min(100, newY));
          }

          // Repel from mouse
          const dx = newX - mousePos.x;
          const dy = newY - mousePos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 15) {
            const force = (15 - distance) / 15;
            newVelocityX += (dx / distance) * force * 0.5;
            newVelocityY += (dy / distance) * force * 0.5;
          }

          // Damping
          newVelocityX *= 0.98;
          newVelocityY *= 0.98;

          return {
            ...block,
            x: newX,
            y: newY,
            velocityX: newVelocityX,
            velocityY: newVelocityY,
            rotation: block.rotation + 0.5
          };
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, [mousePos]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {blocks.map((block) => (
        <div
          key={block.id}
          className={`absolute ${blockColors[block.type]} minecraft-block transition-all duration-100`}
          style={{
            left: `${block.x}%`,
            top: `${block.y}%`,
            width: `${block.size}px`,
            height: `${block.size}px`,
            transform: `translate(-50%, -50%) rotate(${block.rotation}deg)`,
            boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 0 0 2px rgba(255,255,255,0.1)',
            opacity: 0.7
          }}
        />
      ))}
    </div>
  );
};
