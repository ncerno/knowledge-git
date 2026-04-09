"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  drift: number;
}

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const count = Math.floor((canvas.width * canvas.height) / 9000);
      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1 + 0.15,
        opacity: Math.random() * 0.24 + 0.04,
        twinkleSpeed: Math.random() * 0.004 + 0.001,
        twinkleOffset: Math.random() * Math.PI * 2,
        drift: (Math.random() - 0.5) * 0.025,
      }));
    };

    const drawNebula = (time: number) => {
      const leftGlow = ctx.createRadialGradient(
        canvas.width * 0.22,
        canvas.height * 0.16,
        0,
        canvas.width * 0.22,
        canvas.height * 0.16,
        canvas.width * 0.46,
      );
      leftGlow.addColorStop(0, "rgba(56,189,248,0.05)");
      leftGlow.addColorStop(0.55, "rgba(56,189,248,0.018)");
      leftGlow.addColorStop(1, "transparent");
      ctx.fillStyle = leftGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const pulse = (Math.sin(time * 0.00028) + 1) / 2;
      const rightGlow = ctx.createRadialGradient(
        canvas.width * 0.82,
        canvas.height * 0.12,
        0,
        canvas.width * 0.82,
        canvas.height * 0.12,
        canvas.width * 0.3,
      );
      rightGlow.addColorStop(0, `rgba(99,102,241,${0.028 + pulse * 0.014})`);
      rightGlow.addColorStop(1, "transparent");
      ctx.fillStyle = rightGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const render = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#07111f";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawNebula(time);

      starsRef.current.forEach((star) => {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
        const alpha = Math.max(0.02, star.opacity + twinkle * 0.1);
        const radius = Math.max(0.12, star.r + (twinkle > 0.92 ? 0.25 : 0));

        ctx.beginPath();
        ctx.arc(star.x, star.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = star.r > 0.85 ? `rgba(191,219,254,${alpha})` : `rgba(255,255,255,${alpha})`;
        ctx.fill();

        star.x += star.drift;
        if (star.x < -2) star.x = canvas.width + 2;
        if (star.x > canvas.width + 2) star.x = -2;
      });

      rafRef.current = requestAnimationFrame(render);
    };

    window.addEventListener("resize", resize);
    resize();
    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-90" style={{ display: "block" }} />;
}
