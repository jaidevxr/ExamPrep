import { useEffect, useRef, useState } from 'react';

interface Bird {
  x: number;
  y: number;
  speed: number;
  wingPhase: number;
}

export const SceneryBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const birdsRef = useRef<Bird[]>([]);
  const animationFrameRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    // Initialize birds
    birdsRef.current = Array.from({ length: 5 }, () => ({
      x: Math.random() * window.innerWidth,
      y: 50 + Math.random() * 200,
      speed: 1 + Math.random() * 2,
      wingPhase: Math.random() * Math.PI * 2
    }));
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

      timeRef.current += 0.005;
      const time = timeRef.current;

      // Sky gradient with parallax
      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      const sunPosition = Math.sin(time * 0.2) * 0.3 + 0.3;
      skyGradient.addColorStop(0, `hsl(${200 + sunPosition * 40}, 70%, ${60 + sunPosition * 20}%)`);
      skyGradient.addColorStop(0.6, `hsl(${180 + sunPosition * 30}, 60%, ${70 + sunPosition * 10}%)`);
      skyGradient.addColorStop(1, `hsl(${30 + sunPosition * 20}, 80%, 85%)`);
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Sun/Moon
      const sunY = 150 + Math.sin(time * 0.2) * 50;
      const sunX = canvas.width * 0.7 + (mousePos.x - 0.5) * 100;
      
      // Sun glow
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 80);
      sunGlow.addColorStop(0, 'rgba(255, 220, 100, 0.8)');
      sunGlow.addColorStop(0.5, 'rgba(255, 200, 100, 0.3)');
      sunGlow.addColorStop(1, 'rgba(255, 180, 100, 0)');
      ctx.fillStyle = sunGlow;
      ctx.fillRect(sunX - 80, sunY - 80, 160, 160);
      
      // Sun
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 40, 0, Math.PI * 2);
      ctx.fill();

      // Distant mountains (parallax layer 1)
      ctx.fillStyle = 'rgba(100, 120, 150, 0.6)';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * 0.6);
      for (let i = 0; i <= canvas.width; i += 50) {
        const height = Math.sin((i + time * 20) * 0.01) * 30 + Math.sin(i * 0.005) * 50;
        ctx.lineTo(i - (mousePos.x - 0.5) * 20, canvas.height * 0.5 + height);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Mid mountains (parallax layer 2)
      ctx.fillStyle = 'rgba(80, 100, 120, 0.7)';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * 0.7);
      for (let i = 0; i <= canvas.width; i += 40) {
        const height = Math.sin((i + time * 30) * 0.015) * 40 + Math.sin(i * 0.008) * 60;
        ctx.lineTo(i - (mousePos.x - 0.5) * 40, canvas.height * 0.6 + height);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Close mountains (parallax layer 3)
      ctx.fillStyle = 'rgba(60, 80, 100, 0.8)';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * 0.8);
      for (let i = 0; i <= canvas.width; i += 30) {
        const height = Math.sin((i + time * 40) * 0.02) * 50 + Math.sin(i * 0.01) * 70;
        ctx.lineTo(i - (mousePos.x - 0.5) * 60, canvas.height * 0.7 + height);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Ground/Grass
      const groundGradient = ctx.createLinearGradient(0, canvas.height * 0.8, 0, canvas.height);
      groundGradient.addColorStop(0, '#4a7c59');
      groundGradient.addColorStop(1, '#2d5a3d');
      ctx.fillStyle = groundGradient;
      ctx.fillRect(0, canvas.height * 0.8, canvas.width, canvas.height * 0.2);

      // Grass blades
      ctx.strokeStyle = 'rgba(70, 120, 80, 0.6)';
      ctx.lineWidth = 2;
      for (let i = 0; i < canvas.width; i += 15) {
        const grassX = i - (mousePos.x - 0.5) * 80;
        const grassY = canvas.height * 0.8;
        const sway = Math.sin(time * 2 + i * 0.1) * 5;
        const height = 15 + Math.sin(i * 0.5) * 10;
        
        ctx.beginPath();
        ctx.moveTo(grassX, grassY);
        ctx.quadraticCurveTo(grassX + sway, grassY - height / 2, grassX + sway, grassY - height);
        ctx.stroke();
      }

      // Trees
      const drawTree = (x: number, y: number, scale: number) => {
        const treeX = x - (mousePos.x - 0.5) * 70 * scale;
        
        // Trunk
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(treeX - 8 * scale, y, 16 * scale, -60 * scale);
        
        // Foliage
        ctx.fillStyle = '#2e7d32';
        ctx.beginPath();
        ctx.arc(treeX, y - 60 * scale, 35 * scale, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(treeX - 20 * scale, y - 50 * scale, 28 * scale, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(treeX + 20 * scale, y - 50 * scale, 28 * scale, 0, Math.PI * 2);
        ctx.fill();
      };

      drawTree(canvas.width * 0.15, canvas.height * 0.8, 1);
      drawTree(canvas.width * 0.3, canvas.height * 0.8, 0.9);
      drawTree(canvas.width * 0.85, canvas.height * 0.8, 1.1);

      // Birds
      birdsRef.current.forEach((bird) => {
        bird.x += bird.speed;
        bird.wingPhase += 0.1;

        if (bird.x > canvas.width + 50) {
          bird.x = -50;
          bird.y = 50 + Math.random() * 200;
        }

        // Mouse interaction - birds move away
        const dx = bird.x - mousePos.x * canvas.width;
        const dy = bird.y - mousePos.y * canvas.height;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 150) {
          bird.y += (dy / distance) * 2;
          bird.x += (dx / distance) * 2;
        }

        // Draw bird
        ctx.strokeStyle = 'rgba(50, 50, 50, 0.7)';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        const wingY = Math.sin(bird.wingPhase) * 5;
        
        ctx.beginPath();
        ctx.moveTo(bird.x - 10, bird.y + wingY);
        ctx.quadraticCurveTo(bird.x - 5, bird.y - 5 + wingY, bird.x, bird.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(bird.x + 10, bird.y + wingY);
        ctx.quadraticCurveTo(bird.x + 5, bird.y - 5 + wingY, bird.x, bird.y);
        ctx.stroke();
      });

      // Floating particles (pollen/dust)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 20; i++) {
        const particleX = (Math.sin(time * 0.5 + i * 2) * canvas.width * 0.3) + canvas.width * 0.5;
        const particleY = ((time * 30 + i * 80) % canvas.height);
        ctx.beginPath();
        ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
        ctx.fill();
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
