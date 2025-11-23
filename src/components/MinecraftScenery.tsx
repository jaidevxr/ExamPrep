import { useEffect, useRef, useState } from 'react';

interface Cloud {
  x: number;
  y: number;
  width: number;
  speed: number;
}

interface WaterParticle {
  x: number;
  y: number;
  speed: number;
}

export const MinecraftScenery = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const cloudsRef = useRef<Cloud[]>([]);
  const waterParticlesRef = useRef<WaterParticle[]>([]);
  const animationFrameRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    // Initialize clouds
    cloudsRef.current = Array.from({ length: 12 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: 30 + Math.random() * 150,
      width: 80 + Math.random() * 120,
      speed: 0.3 + Math.random() * 0.5
    }));

    waterParticlesRef.current = [];
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

    // Draw a blocky/voxel cube
    const drawBlock = (x: number, y: number, size: number, color: string, darkColor: string) => {
      // Top face
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x + size * 1.5, y - size * 0.5);
      ctx.lineTo(x + size * 0.5, y - size * 0.5);
      ctx.closePath();
      ctx.fill();

      // Left face
      ctx.fillStyle = darkColor;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + size * 0.5, y - size * 0.5);
      ctx.lineTo(x + size * 0.5, y + size * 0.5);
      ctx.lineTo(x, y + size);
      ctx.closePath();
      ctx.fill();

      // Right face
      const evenDarker = adjustBrightness(darkColor, -20);
      ctx.fillStyle = evenDarker;
      ctx.beginPath();
      ctx.moveTo(x + size, y);
      ctx.lineTo(x + size * 1.5, y - size * 0.5);
      ctx.lineTo(x + size * 1.5, y + size * 0.5);
      ctx.lineTo(x + size, y + size);
      ctx.closePath();
      ctx.fill();
    };

    const adjustBrightness = (color: string, amount: number): string => {
      const hex = color.replace('#', '');
      const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
      const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
      const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    const drawBlockyTree = (baseX: number, baseY: number, scale: number) => {
      const x = baseX - (mousePos.x - 0.5) * 40 * scale;
      const blockSize = 16 * scale;

      // Trunk (2x1x4 blocks)
      for (let i = 0; i < 4; i++) {
        drawBlock(x, baseY - i * blockSize, blockSize, '#6B4423', '#4A2F1A');
        drawBlock(x + blockSize, baseY - i * blockSize, blockSize, '#6B4423', '#4A2F1A');
      }

      // Foliage (5x5x4 cube of leaves)
      const leafColors = ['#2D7A2D', '#248F24', '#1F6B1F'];
      for (let layer = 0; layer < 4; layer++) {
        for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 5; col++) {
            // Skip some blocks for more natural look
            if (layer === 0 && (row === 0 || row === 4 || col === 0 || col === 4)) continue;
            if (layer === 3 && (row < 2 || row > 2 || col < 2 || col > 2)) continue;
            
            const leafColor = leafColors[Math.floor(Math.random() * leafColors.length)];
            drawBlock(
              x + (col - 2) * blockSize,
              baseY - (4 + layer) * blockSize - row * blockSize * 0.5,
              blockSize,
              leafColor,
              adjustBrightness(leafColor, -30)
            );
          }
        }
      }
    };

    const drawCliff = (startX: number, startY: number, width: number, height: number) => {
      const x = startX - (mousePos.x - 0.5) * 30;
      const blockSize = 20;
      const cols = Math.floor(width / blockSize);
      const rows = Math.floor(height / blockSize);

      const stoneColors = ['#7A7A7A', '#6B6B6B', '#5C5C5C', '#8A8A8A'];
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // Create jagged cliff edge
          if (col === 0 && Math.random() > 0.7) continue;
          if (col === cols - 1 && Math.random() > 0.7) continue;
          
          const color = stoneColors[Math.floor(Math.random() * stoneColors.length)];
          drawBlock(
            x + col * blockSize,
            startY + row * blockSize,
            blockSize,
            color,
            adjustBrightness(color, -25)
          );
        }
      }
    };

    const drawWaterBlock = (x: number, y: number, size: number, flowing: boolean = false) => {
      const baseColor = flowing ? '#3A8FCC' : '#2B7FBF';
      const alpha = flowing ? '0.8' : '0.9';
      
      ctx.fillStyle = baseColor + Math.floor(parseFloat(alpha) * 255).toString(16);
      ctx.fillRect(x, y, size, size);
      
      // Water shimmer
      ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + Math.sin(timeRef.current * 3 + x * 0.1) * 0.1})`;
      ctx.fillRect(x, y, size, size * 0.3);
    };

    const animate = () => {
      if (!ctx || !canvas) return;

      timeRef.current += 0.01;

      // Sky gradient
      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6);
      skyGradient.addColorStop(0, '#87CEEB');
      skyGradient.addColorStop(0.5, '#B0D8F0');
      skyGradient.addColorStop(1, '#D5E8F5');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Clouds (realistic fluffy style)
      cloudsRef.current.forEach(cloud => {
        cloud.x += cloud.speed;
        if (cloud.x > canvas.width + cloud.width) {
          cloud.x = -cloud.width;
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 10;
        
        // Draw fluffy cloud shape
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.width * 0.3, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width * 0.3, cloud.y - cloud.width * 0.1, cloud.width * 0.35, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width * 0.6, cloud.y, cloud.width * 0.3, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width * 0.3, cloud.y + cloud.width * 0.15, cloud.width * 0.25, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
      });

      // Background mountains
      drawCliff(canvas.width * 0.1, canvas.height * 0.35, 200, 150);
      drawCliff(canvas.width * 0.7, canvas.height * 0.38, 250, 180);

      // Main cliff with waterfalls
      drawCliff(canvas.width * 0.4, canvas.height * 0.4, 300, 200);

      // Waterfall 1
      const waterfall1X = canvas.width * 0.45;
      const waterfall1Top = canvas.height * 0.4;
      const waterfall1Bottom = canvas.height * 0.72;
      
      for (let y = waterfall1Top; y < waterfall1Bottom; y += 20) {
        drawWaterBlock(waterfall1X, y, 20, true);
      }

      // Add waterfall particles
      if (Math.random() > 0.6) {
        waterParticlesRef.current.push({
          x: waterfall1X + Math.random() * 20,
          y: waterfall1Top,
          speed: 4 + Math.random() * 3
        });
      }

      // Waterfall 2
      const waterfall2X = canvas.width * 0.55;
      for (let y = waterfall1Top + 40; y < waterfall1Bottom; y += 20) {
        drawWaterBlock(waterfall2X, y, 20, true);
      }

      // Animate water particles
      waterParticlesRef.current = waterParticlesRef.current.filter(particle => {
        particle.y += particle.speed;
        
        if (particle.y < waterfall1Bottom) {
          ctx.fillStyle = 'rgba(200, 230, 255, 0.7)';
          ctx.fillRect(particle.x, particle.y, 4, 8);
          return true;
        }
        return false;
      });

      // Water pools at bottom
      const poolY = canvas.height * 0.72;
      for (let x = canvas.width * 0.42; x < canvas.width * 0.6; x += 20) {
        for (let y = poolY; y < canvas.height * 0.78; y += 20) {
          drawWaterBlock(x, y, 20, false);
        }
      }

      // Grass terrain (blocky style)
      const terrainY = canvas.height * 0.75;
      const blockSize = 20;
      
      // Grass layer
      for (let x = 0; x < canvas.width; x += blockSize) {
        const xOffset = x - (mousePos.x - 0.5) * 50;
        drawBlock(xOffset, terrainY, blockSize, '#6FA945', '#5A8C37');
      }

      // Dirt layers below
      for (let layer = 1; layer < 4; layer++) {
        for (let x = 0; x < canvas.width; x += blockSize) {
          const xOffset = x - (mousePos.x - 0.5) * 50;
          drawBlock(xOffset, terrainY + layer * blockSize, blockSize, '#8B6F47', '#6D5637');
        }
      }

      // Blocky trees
      drawBlockyTree(canvas.width * 0.15, canvas.height * 0.75, 1);
      drawBlockyTree(canvas.width * 0.25, canvas.height * 0.75, 0.9);
      drawBlockyTree(canvas.width * 0.32, canvas.height * 0.75, 1.1);
      drawBlockyTree(canvas.width * 0.68, canvas.height * 0.75, 0.95);
      drawBlockyTree(canvas.width * 0.78, canvas.height * 0.75, 1.05);
      drawBlockyTree(canvas.width * 0.88, canvas.height * 0.75, 1);

      // Small flowers/plants
      const flowerColors = ['#FF6B6B', '#FFD93D', '#6BCF7F', '#A78BFA'];
      for (let i = 0; i < 20; i++) {
        const flowerX = (canvas.width * 0.1 * i + timeRef.current * 10) % canvas.width;
        const flowerY = canvas.height * 0.75 - 5;
        const color = flowerColors[i % flowerColors.length];
        
        ctx.fillStyle = color;
        ctx.fillRect(flowerX - (mousePos.x - 0.5) * 50, flowerY, 8, 8);
      }

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
    />
  );
};
