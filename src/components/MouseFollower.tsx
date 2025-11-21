import { useEffect, useState } from "react";

export const MouseFollower = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let trailId = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const newPos = { x: e.clientX, y: e.clientY };
      setPosition(newPos);
      setIsMoving(true);

      // Add trail effect
      setTrail(prev => [...prev.slice(-8), { ...newPos, id: trailId++ }]);

      clearTimeout(timeout);
      timeout = setTimeout(() => setIsMoving(false), 150);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <>
      {/* Trail particles */}
      {trail.map((pos, index) => (
        <div
          key={pos.id}
          className="fixed pointer-events-none z-40"
          style={{
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            transform: "translate(-50%, -50%)",
            opacity: (index + 1) / trail.length * 0.4,
          }}
        >
          <div 
            className="w-1 h-1 bg-primary rounded-full"
            style={{
              boxShadow: `0 0 ${4 + index * 2}px hsl(var(--primary))`,
            }}
          />
        </div>
      ))}

      {/* Main cursor ring */}
      <div
        className="fixed pointer-events-none z-50"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: "translate(-50%, -50%)",
          transition: "transform 0.1s ease-out",
        }}
      >
        <div
          className={`w-10 h-10 border-2 border-primary/60 rounded-full transition-all duration-150 ${
            isMoving ? "scale-150 border-accent/80" : "scale-100"
          }`}
          style={{
            boxShadow: isMoving 
              ? "0 0 20px hsla(var(--primary), 0.6)" 
              : "0 0 10px hsla(var(--primary), 0.4)",
          }}
        />
      </div>

      {/* Center dot */}
      <div
        className="fixed pointer-events-none z-50"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: "translate(-50%, -50%)",
          transition: "left 0.15s ease-out, top 0.15s ease-out",
        }}
      >
        <div 
          className="w-2 h-2 bg-primary rounded-full" 
          style={{
            boxShadow: "0 0 8px hsl(var(--primary))",
          }}
        />
      </div>
    </>
  );
};
