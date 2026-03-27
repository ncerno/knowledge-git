"use client";

import { useEffect, useRef } from "react";

interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  opacitySpeed: number;
  opacityDir: number;
  shape: "ellipse" | "diamond" | "teardrop";
}

function createPetal(canvasWidth: number, canvasHeight: number): Petal {
  return {
    x: Math.random() * canvasWidth,
    y: -10 - Math.random() * canvasHeight * 0.3,
    size: Math.random() * 3.5 + 1.2,
    speedY: Math.random() * 0.35 + 0.08,
    speedX: (Math.random() - 0.5) * 0.18,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.006,
    opacity: Math.random() * 0.3 + 0.1,
    opacitySpeed: Math.random() * 0.002 + 0.0005,
    opacityDir: 1,
    shape: (["ellipse", "diamond", "teardrop"] as const)[Math.floor(Math.random() * 3)],
  };
}

function drawPetal(ctx: CanvasRenderingContext2D, petal: Petal) {
  ctx.save();
  ctx.translate(petal.x, petal.y);
  ctx.rotate(petal.rotation);
  ctx.globalAlpha = petal.opacity;

  // 微光白色渐变
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, petal.size * 2);
  grad.addColorStop(0, "rgba(255,255,255,0.95)");
  grad.addColorStop(0.6, "rgba(200,240,255,0.6)");
  grad.addColorStop(1, "rgba(180,230,255,0)");
  ctx.fillStyle = grad;

  ctx.beginPath();
  if (petal.shape === "ellipse") {
    ctx.ellipse(0, 0, petal.size * 2, petal.size, 0, 0, Math.PI * 2);
  } else if (petal.shape === "diamond") {
    ctx.moveTo(0, -petal.size * 2);
    ctx.lineTo(petal.size, 0);
    ctx.lineTo(0, petal.size * 2);
    ctx.lineTo(-petal.size, 0);
    ctx.closePath();
  } else {
    // teardrop
    ctx.moveTo(0, -petal.size * 2.2);
    ctx.bezierCurveTo(petal.size * 1.2, -petal.size, petal.size * 1.2, petal.size, 0, petal.size * 1.5);
    ctx.bezierCurveTo(-petal.size * 1.2, petal.size, -petal.size * 1.2, -petal.size, 0, -petal.size * 2.2);
    ctx.closePath();
  }
  ctx.fill();
  ctx.restore();
}

export default function PetalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const petalsRef = useRef<Petal[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const PETAL_COUNT = 18;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // 初始化花瓣，分布在整个屏幕高度范围内
    petalsRef.current = Array.from({ length: PETAL_COUNT }, () => {
      const p = createPetal(window.innerWidth, window.innerHeight);
      p.y = Math.random() * window.innerHeight; // 初始散布
      return p;
    });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      petalsRef.current.forEach((petal, i) => {
        // 呼吸感透明度波动
        petal.opacity += petal.opacitySpeed * petal.opacityDir;
        if (petal.opacity > 0.75 || petal.opacity < 0.1) {
          petal.opacityDir *= -1;
        }

        // 更新位置 — 正弦波横向漂移
        petal.y += petal.speedY;
        petal.x += petal.speedX + Math.sin(petal.y * 0.018 + i) * 0.12;
        petal.rotation += petal.rotationSpeed;

        // 离屏后从顶部重生
        if (petal.y > canvas.height + 20 || petal.x < -30 || petal.x > canvas.width + 30) {
          petalsRef.current[i] = createPetal(canvas.width, canvas.height);
        }

        drawPetal(ctx, petal);
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    resize();
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-5 pointer-events-none"
      style={{ display: "block", zIndex: 5 }}
    />
  );
}

