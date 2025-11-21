import { useEffect, useRef, useState } from 'react';

interface RainDrop {
  x: number;
  y: number;
  speed: number;
  length: number;
}

export const PixelRainScene = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const rainRef = useRef<RainDrop[]>([]);
  const animationFrameRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    // Initialize rain
    rainRef.current = Array.from({ length: 150 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      speed: 8 + Math.random() * 12,
      length: 15 + Math.random() * 25
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Disable image smoothing for pixel art
    ctx.imageSmoothingEnabled = false;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Pixel size for pixelated effect
    const pixelSize = 4;

    const drawPixelRect = (x: number, y: number, width: number, height: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(Math.floor(x / pixelSize) * pixelSize, Math.floor(y / pixelSize) * pixelSize, 
                   Math.ceil(width / pixelSize) * pixelSize, Math.ceil(height / pixelSize) * pixelSize);
    };

    const drawBuilding = (x: number, y: number, width: number, height: number, color: string, hasWindows: boolean = true) => {
      // Building body
      drawPixelRect(x, y, width, height, color);
      
      if (hasWindows) {
        // Windows
        const windowSize = 12;
        const windowSpacing = 20;
        const windowCols = Math.floor(width / windowSpacing);
        const windowRows = Math.floor(height / (windowSpacing + 10));
        
        for (let row = 0; row < windowRows; row++) {
          for (let col = 0; col < windowCols; col++) {
            const wx = x + col * windowSpacing + 6;
            const wy = y + 20 + row * (windowSpacing + 10);
            
            // Random window lights
            if (Math.random() > 0.3) {
              const windowColor = Math.random() > 0.7 ? '#9b87f5' : '#6e9ecf';
              drawPixelRect(wx, wy, windowSize, windowSize, windowColor);
            }
          }
        }
      }
    };

    const drawFoliage = (x: number, y: number, width: number, height: number) => {
      const foliageColors = [
        '#1a4d2e',
        '#2d5a3d', 
        '#1f3d2a',
        '#0d2818',
        '#3a6f4a'
      ];
      
      // Create organic foliage pattern
      for (let dy = 0; dy < height; dy += pixelSize * 2) {
        for (let dx = 0; dx < width; dx += pixelSize * 2) {
          const noise = Math.sin(dx * 0.05 + timeRef.current) * Math.cos(dy * 0.03);
          if (noise > -0.3) {
            const color = foliageColors[Math.floor(Math.random() * foliageColors.length)];
            const size = pixelSize * (2 + Math.floor(Math.random() * 3));
            drawPixelRect(x + dx, y + dy, size, size, color);
          }
        }
      }
    };

    const animate = () => {
      if (!ctx || !canvas) return;

      timeRef.current += 0.01;

      // Sky gradient (rainy atmosphere)
      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGradient.addColorStop(0, '#7ea5b8');
      skyGradient.addColorStop(0.5, '#8fb5c7');
      skyGradient.addColorStop(1, '#a8c5d1');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Background city layer (furthest)
      const bgBuildings = [
        { x: 50, width: 80, height: 120 },
        { x: 150, width: 100, height: 100 },
        { x: 280, width: 90, height: 140 },
        { x: 400, width: 70, height: 110 },
        { x: 500, width: 95, height: 130 },
      ];

      const cityY = canvas.height * 0.35;
      
      bgBuildings.forEach(building => {
        const adjustedX = building.x * (canvas.width / 600) - (mousePos.x - 0.5) * 20;
        drawBuilding(adjustedX, cityY, building.width, building.height, '#5a7a8a', false);
      });

      // Mid city layer
      const midBuildings = [
        { x: 100, width: 90, height: 160 },
        { x: 220, width: 85, height: 140 },
        { x: 330, width: 110, height: 180 },
        { x: 470, width: 100, height: 150 },
        { x: 600, width: 80, height: 120 },
      ];

      midBuildings.forEach(building => {
        const adjustedX = building.x * (canvas.width / 700) - (mousePos.x - 0.5) * 40;
        drawBuilding(adjustedX, cityY + 50, building.width, building.height, '#6b8a99', true);
      });

      // Foreground city layer
      const fgBuildings = [
        { x: 20, width: 100, height: 200 },
        { x: 150, width: 95, height: 180 },
        { x: 270, width: 120, height: 220 },
        { x: 420, width: 85, height: 190 },
        { x: 540, width: 110, height: 210 },
      ];

      fgBuildings.forEach(building => {
        const adjustedX = building.x * (canvas.width / 650) - (mousePos.x - 0.5) * 60;
        drawBuilding(adjustedX, cityY + 100, building.width, building.height, '#7a9aaa', true);
      });

      // Dense foliage foreground (bottom half)
      const foliageY = canvas.height * 0.5;
      drawFoliage(0 - (mousePos.x - 0.5) * 80, foliageY, canvas.width + 160, canvas.height - foliageY);

      // Add some brighter foliage highlights
      const highlights = [
        { x: 100, y: foliageY + 50, size: 40 },
        { x: 300, y: foliageY + 80, size: 50 },
        { x: canvas.width - 200, y: foliageY + 60, size: 45 },
      ];

      highlights.forEach(h => {
        const adjustedX = h.x - (mousePos.x - 0.5) * 90;
        for (let i = 0; i < 20; i++) {
          const angle = (i / 20) * Math.PI * 2;
          const radius = h.size + Math.sin(timeRef.current * 2 + i) * 10;
          const px = adjustedX + Math.cos(angle) * radius;
          const py = h.y + Math.sin(angle) * radius;
          drawPixelRect(px, py, pixelSize * 3, pixelSize * 3, '#4da64d');
        }
      });

      // Rain
      rainRef.current.forEach((drop) => {
        drop.y += drop.speed;
        drop.x += Math.sin(timeRef.current * 2) * 1.5;

        if (drop.y > canvas.height) {
          drop.y = -20;
          drop.x = Math.random() * canvas.width;
        }

        // Pixelated rain
        ctx.strokeStyle = 'rgba(200, 220, 235, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const startX = Math.floor(drop.x / pixelSize) * pixelSize;
        const startY = Math.floor(drop.y / pixelSize) * pixelSize;
        const endY = Math.floor((drop.y + drop.length) / pixelSize) * pixelSize;
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX, endY);
        ctx.stroke();

        // Rain splash on foliage
        if (drop.y > foliageY) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.beginPath();
          ctx.arc(startX, drop.y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Atmospheric mist/fog effect
      ctx.fillStyle = 'rgba(168, 197, 209, 0.1)';
      ctx.fillRect(0, cityY, canvas.width, canvas.height * 0.3);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mousePos]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};
