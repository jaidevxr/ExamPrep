import { useEffect, useRef, useState } from 'react';

interface RainDrop {
  x: number;
  y: number;
  speed: number;
  length: number;
}

interface WaterfallParticle {
  x: number;
  y: number;
  speedY: number;
  opacity: number;
}

export const DetailedScenery = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const rainRef = useRef<RainDrop[]>([]);
  const waterfallParticlesRef = useRef<WaterfallParticle[]>([]);
  const animationFrameRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    // Initialize rain
    rainRef.current = Array.from({ length: 100 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      speed: 5 + Math.random() * 10,
      length: 10 + Math.random() * 20
    }));

    // Initialize waterfall particles
    waterfallParticlesRef.current = [];
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

    const animate = () => {
      if (!ctx || !canvas) return;

      timeRef.current += 0.008;
      const time = timeRef.current;

      // Sky with rain clouds
      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6);
      skyGradient.addColorStop(0, '#6b7c8f');
      skyGradient.addColorStop(0.5, '#8a9ba8');
      skyGradient.addColorStop(1, '#b8c5d0');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Distant mountains
      ctx.fillStyle = 'rgba(80, 90, 110, 0.7)';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * 0.4);
      for (let i = 0; i <= canvas.width; i += 40) {
        const height = Math.sin(i * 0.003) * 100 + Math.sin(i * 0.008) * 50;
        ctx.lineTo(i - (mousePos.x - 0.5) * 30, canvas.height * 0.35 + height);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Mid mountains with waterfall source
      ctx.fillStyle = 'rgba(60, 80, 70, 0.8)';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * 0.5);
      for (let i = 0; i <= canvas.width; i += 30) {
        const height = Math.sin(i * 0.005) * 80 + Math.sin(i * 0.01) * 40;
        ctx.lineTo(i - (mousePos.x - 0.5) * 50, canvas.height * 0.45 + height);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Waterfall
      const waterfallX = canvas.width * 0.65;
      const waterfallTop = canvas.height * 0.42;
      const waterfallBottom = canvas.height * 0.75;

      // Waterfall main stream
      const waterfallGradient = ctx.createLinearGradient(
        waterfallX, waterfallTop, 
        waterfallX, waterfallBottom
      );
      waterfallGradient.addColorStop(0, 'rgba(180, 220, 240, 0.9)');
      waterfallGradient.addColorStop(1, 'rgba(150, 200, 220, 0.7)');
      ctx.fillStyle = waterfallGradient;
      ctx.fillRect(waterfallX - 15, waterfallTop, 30, waterfallBottom - waterfallTop);

      // Add waterfall particles
      if (Math.random() > 0.7) {
        waterfallParticlesRef.current.push({
          x: waterfallX + (Math.random() - 0.5) * 30,
          y: waterfallTop,
          speedY: 3 + Math.random() * 2,
          opacity: 0.6 + Math.random() * 0.4
        });
      }

      // Animate waterfall particles
      waterfallParticlesRef.current = waterfallParticlesRef.current.filter(particle => {
        particle.y += particle.speedY;
        
        if (particle.y < waterfallBottom) {
          ctx.fillStyle = `rgba(200, 230, 255, ${particle.opacity})`;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
          ctx.fill();
          return true;
        }
        return false;
      });

      // Water pool at bottom
      ctx.fillStyle = 'rgba(100, 180, 200, 0.6)';
      ctx.beginPath();
      ctx.ellipse(waterfallX, waterfallBottom + 20, 80, 30, 0, 0, Math.PI * 2);
      ctx.fill();

      // Water ripples
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = `rgba(150, 200, 220, ${0.3 - i * 0.1})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const rippleSize = 60 + (time * 50 + i * 30) % 60;
        ctx.ellipse(waterfallX, waterfallBottom + 20, rippleSize, rippleSize * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Ground with grass
      const groundGradient = ctx.createLinearGradient(0, canvas.height * 0.7, 0, canvas.height);
      groundGradient.addColorStop(0, '#3a5f3a');
      groundGradient.addColorStop(1, '#2d4a2d');
      ctx.fillStyle = groundGradient;
      ctx.fillRect(0, canvas.height * 0.75, canvas.width, canvas.height * 0.25);

      // Draw detailed trees
      const drawDetailedTree = (x: number, y: number, scale: number) => {
        const treeX = x - (mousePos.x - 0.5) * 60 * scale;
        
        // Trunk with texture
        ctx.fillStyle = '#4a3829';
        ctx.fillRect(treeX - 12 * scale, y, 24 * scale, -80 * scale);
        
        // Trunk details
        ctx.strokeStyle = '#3d2d1f';
        ctx.lineWidth = 2 * scale;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(treeX - 8 * scale, y - 20 * i * scale);
          ctx.lineTo(treeX + 8 * scale, y - 25 * i * scale);
          ctx.stroke();
        }
        
        // Lush foliage layers
        const foliageLayers = [
          { y: -90, size: 50, color: '#1a4d1a' },
          { y: -75, size: 55, color: '#2d6b2d' },
          { y: -60, size: 50, color: '#3a8f3a' },
          { y: -45, size: 45, color: '#4da64d' }
        ];
        
        foliageLayers.forEach(layer => {
          ctx.fillStyle = layer.color;
          ctx.beginPath();
          ctx.arc(treeX, y + layer.y * scale, layer.size * scale, 0, Math.PI * 2);
          ctx.fill();
          
          // Side foliage
          ctx.beginPath();
          ctx.arc(treeX - 30 * scale, y + (layer.y + 10) * scale, (layer.size - 10) * scale, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.beginPath();
          ctx.arc(treeX + 30 * scale, y + (layer.y + 10) * scale, (layer.size - 10) * scale, 0, Math.PI * 2);
          ctx.fill();
        });
      };

      // Draw beautiful house with leaves
      const drawHouse = (x: number, y: number) => {
        const houseX = x - (mousePos.x - 0.5) * 70;
        
        // House base (minecraft style blocks)
        ctx.fillStyle = '#8b6f47';
        ctx.fillRect(houseX, y - 100, 120, 100);
        
        // Block texture
        ctx.strokeStyle = '#6d5637';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 4; j++) {
            ctx.strokeRect(houseX + j * 30, y - 100 + i * 25, 30, 25);
          }
        }
        
        // Window
        ctx.fillStyle = '#87ceeb';
        ctx.fillRect(houseX + 20, y - 70, 30, 30);
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 3;
        ctx.strokeRect(houseX + 20, y - 70, 30, 30);
        ctx.beginPath();
        ctx.moveTo(houseX + 35, y - 70);
        ctx.lineTo(houseX + 35, y - 40);
        ctx.moveTo(houseX + 20, y - 55);
        ctx.lineTo(houseX + 50, y - 55);
        ctx.stroke();
        
        // Door
        ctx.fillStyle = '#654321';
        ctx.fillRect(houseX + 70, y - 60, 35, 60);
        ctx.strokeStyle = '#4a3020';
        ctx.lineWidth = 2;
        ctx.strokeRect(houseX + 70, y - 60, 35, 60);
        
        // Door handle
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(houseX + 95, y - 30, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Roof
        ctx.fillStyle = '#8b4513';
        ctx.beginPath();
        ctx.moveTo(houseX - 20, y - 100);
        ctx.lineTo(houseX + 60, y - 150);
        ctx.lineTo(houseX + 140, y - 100);
        ctx.closePath();
        ctx.fill();
        
        // Roof texture
        ctx.strokeStyle = '#6d3410';
        ctx.lineWidth = 2;
        for (let i = 0; i < 10; i++) {
          ctx.beginPath();
          ctx.moveTo(houseX - 10 + i * 15, y - 100 + i * 5);
          ctx.lineTo(houseX + 60, y - 150);
          ctx.stroke();
        }
        
        // Leaves/vines on house
        ctx.fillStyle = 'rgba(34, 139, 34, 0.7)';
        for (let i = 0; i < 5; i++) {
          const vineX = houseX + 10 + i * 25;
          ctx.beginPath();
          ctx.moveTo(vineX, y - 100);
          for (let j = 0; j < 8; j++) {
            const curve = Math.sin(time * 2 + i + j * 0.5) * 5;
            ctx.quadraticCurveTo(
              vineX + curve, y - 95 + j * 12,
              vineX, y - 88 + j * 12
            );
          }
          ctx.lineWidth = 4;
          ctx.strokeStyle = 'rgba(34, 139, 34, 0.8)';
          ctx.stroke();
          
          // Leaves on vines
          for (let k = 0; k < 3; k++) {
            ctx.fillStyle = 'rgba(50, 150, 50, 0.8)';
            ctx.beginPath();
            ctx.ellipse(vineX + 5, y - 85 + k * 30, 8, 5, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        
        // Chimney
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(houseX + 90, y - 140, 20, 40);
        ctx.strokeStyle = '#6d3410';
        ctx.lineWidth = 2;
        ctx.strokeRect(houseX + 90, y - 140, 20, 40);
        
        // Smoke
        for (let i = 0; i < 5; i++) {
          const smokeY = y - 140 - i * 15 - (time * 20) % 20;
          const smokeX = houseX + 100 + Math.sin(time + i) * 10;
          ctx.fillStyle = `rgba(200, 200, 200, ${0.5 - i * 0.1})`;
          ctx.beginPath();
          ctx.arc(smokeX, smokeY, 8 + i * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      };

      // Place trees
      drawDetailedTree(canvas.width * 0.15, canvas.height * 0.75, 1.2);
      drawDetailedTree(canvas.width * 0.25, canvas.height * 0.75, 0.9);
      drawDetailedTree(canvas.width * 0.35, canvas.height * 0.75, 1.1);
      drawDetailedTree(canvas.width * 0.82, canvas.height * 0.75, 1);
      drawDetailedTree(canvas.width * 0.92, canvas.height * 0.75, 1.15);

      // Place house
      drawHouse(canvas.width * 0.5, canvas.height * 0.75);

      // Grass blades
      ctx.strokeStyle = 'rgba(60, 150, 60, 0.6)';
      ctx.lineWidth = 2;
      for (let i = 0; i < canvas.width; i += 12) {
        const grassX = i - (mousePos.x - 0.5) * 80;
        const grassY = canvas.height * 0.75;
        const sway = Math.sin(time * 2 + i * 0.1) * 4;
        const height = 12 + Math.sin(i * 0.5) * 8;
        
        ctx.beginPath();
        ctx.moveTo(grassX, grassY);
        ctx.quadraticCurveTo(grassX + sway, grassY - height / 2, grassX + sway, grassY - height);
        ctx.stroke();
      }

      // Rain
      rainRef.current.forEach((drop) => {
        drop.y += drop.speed;
        drop.x += Math.sin(time * 2) * 0.5;

        if (drop.y > canvas.height) {
          drop.y = -20;
          drop.x = Math.random() * canvas.width;
        }

        ctx.strokeStyle = 'rgba(174, 194, 224, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        ctx.stroke();
      });

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
