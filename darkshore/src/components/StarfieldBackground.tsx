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
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      generateStars();
    };

    const generateStars = () => {
      const count = Math.floor((canvas.width * canvas.height) / 5000);
      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.15,
        opacity: Math.random() * 0.4 + 0.08,
        twinkleSpeed: Math.random() * 0.006 + 0.001,
        twinkleOffset: Math.random() * Math.PI * 2,
        drift: (Math.random() - 0.5) * 0.05,
      }));
    };

    const drawNebula = (t: number) => {
      // 深邃星云背景渐变（更柔和）
      const grad = ctx.createRadialGradient(
        canvas.width * 0.3, canvas.height * 0.4, 0,
        canvas.width * 0.3, canvas.height * 0.4, canvas.width * 0.7
      );
      grad.addColorStop(0, "rgba(0,60,120,0.05)");
      grad.addColorStop(0.5, "rgba(0,20,60,0.02)");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 第二个星云点
      const pulse = Math.sin(t * 0.0005) * 0.015;
      const grad2 = ctx.createRadialGradient(
        canvas.width * 0.75, canvas.height * 0.6, 0,
        canvas.width * 0.75, canvas.height * 0.6, canvas.width * 0.4
      );
      grad2.addColorStop(0, `rgba(0,200,255,${0.025 + pulse})`);
      grad2.addColorStop(1, "transparent");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const drawStars = (t: number) => {
      starsRef.current.forEach((star) => {
        const twinkle = Math.sin(t * star.twinkleSpeed + star.twinkleOffset);
        const alpha = star.opacity + twinkle * 0.25;
        const radius = star.r + (twinkle > 0.8 ? 0.5 : 0);

        // 闪光星点的十字光晕（更柔和）
        if (star.r > 1.0 && twinkle > 0.7) {
          ctx.save();
          ctx.globalAlpha = alpha * 0.15;
          ctx.strokeStyle = "#00e5ff";
          ctx.lineWidth = 0.4;
          ctx.beginPath();
          ctx.moveTo(star.x - radius * 3, star.y);
          ctx.lineTo(star.x + radius * 3, star.y);
          ctx.moveTo(star.x, star.y - radius * 3);
          ctx.lineTo(star.x, star.y + radius * 3);
          ctx.stroke();
          ctx.restore();
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, Math.max(0.1, radius), 0, Math.PI * 2);

        // 大星用青色调，小星纯白
        const color = star.r > 1.0 ? `rgba(180,240,255,${Math.max(0, alpha)})` : `rgba(255,255,255,${Math.max(0, alpha)})`;
        ctx.fillStyle = color;
        ctx.fill();

        // 缓慢漂移
        star.x += star.drift;
        if (star.x < -2) star.x = canvas.width + 2;
        if (star.x > canvas.width + 2) star.x = -2;
      });
    };

    const render = (t: number) => {
      timeRef.current = t;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 深蓝底色
      ctx.fillStyle = "#0a0f1d";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawNebula(t);
      drawStars(t);

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

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ display: "block" }}
    />
  );
}

