import { useEffect, useRef, useState } from 'react';

interface Cloud {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

export const LofiBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cloudsRef = useRef<Cloud[]>([]);
  const starsRef = useRef<Star[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    // Initialize clouds
    cloudsRef.current = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight * 0.6,
      size: 80 + Math.random() * 120,
      speed: 0.2 + Math.random() * 0.3,
      opacity: 0.3 + Math.random() * 0.4
    }));

    // Initialize stars
    starsRef.current = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight * 0.7,
      size: 1 + Math.random() * 2,
      twinkleSpeed: 0.02 + Math.random() * 0.03,
      twinkleOffset: Math.random() * Math.PI * 2
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

    let time = 0;

    const animate = () => {
      if (!ctx || !canvas) return;

      time += 0.01;

      // Gradient background - peaceful sunset/twilight colors
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1a1b3d');
      gradient.addColorStop(0.5, '#4a5568');
      gradient.addColorStop(1, '#e9d5ff');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars with twinkling effect
      starsRef.current.forEach((star) => {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
        const opacity = 0.3 + (twinkle * 0.7);
        
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Subtle glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw and move clouds
      cloudsRef.current.forEach((cloud) => {
        // Mouse interaction - clouds move away slightly
        const dx = cloud.x - mousePos.x * canvas.width;
        const dy = cloud.y - mousePos.y * canvas.height;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 200;

        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance;
          cloud.x += (dx / distance) * force * 2;
          cloud.y += (dy / distance) * force * 2;
        }

        // Normal movement
        cloud.x += cloud.speed;

        // Wrap around
        if (cloud.x > canvas.width + cloud.size) {
          cloud.x = -cloud.size;
          cloud.y = Math.random() * canvas.height * 0.6;
        }

        // Draw soft clouds
        ctx.fillStyle = `rgba(168, 162, 158, ${cloud.opacity})`;
        
        // Cloud shape made of circles
        const circles = [
          { x: 0, y: 0, r: cloud.size * 0.5 },
          { x: cloud.size * 0.4, y: -cloud.size * 0.1, r: cloud.size * 0.4 },
          { x: cloud.size * 0.8, y: 0, r: cloud.size * 0.45 },
          { x: -cloud.size * 0.3, y: cloud.size * 0.1, r: cloud.size * 0.35 }
        ];

        circles.forEach(circle => {
          ctx.beginPath();
          ctx.arc(cloud.x + circle.x, cloud.y + circle.y, circle.r, 0, Math.PI * 2);
          ctx.fill();
        });
      });

      // Floating particles (like dust in lofi videos)
      for (let i = 0; i < 30; i++) {
        const particleX = (Math.sin(time * 0.5 + i) * canvas.width * 0.4) + canvas.width / 2;
        const particleY = ((time * 20 + i * 50) % canvas.height);
        const particleSize = 2 + Math.sin(time + i) * 1;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + Math.sin(time + i) * 0.2})`;
        ctx.beginPath();
        ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
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
      style={{ background: 'linear-gradient(to bottom, #1a1b3d, #4a5568, #e9d5ff)' }}
    />
  );
};
