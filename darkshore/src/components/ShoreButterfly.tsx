"use client";

import { motion } from "framer-motion";

/**
 * 守岸人标志性蓝蝴蝶 — 来自鸣潮世界观
 * 蝴蝶是守岸人最核心的视觉符号，代表着记忆、守护与海岸。
 * 使用纯 SVG 绘制，带有轻柔的悬浮动画。
 */
export default function ShoreButterfly({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`pointer-events-none select-none ${className}`}
      animate={{ y: [0, -6, 0], rotate: [-2, 3, -2] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg
        width="48"
        height="42"
        viewBox="0 0 48 42"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_12px_rgba(34,211,238,0.3)]"
      >
        {/* 左上翅 */}
        <path
          d="M24 18 C18 6, 4 2, 2 12 C0 20, 10 24, 24 21"
          fill="url(#wing-left-top)"
          opacity="0.85"
        />
        {/* 左下翅 */}
        <path
          d="M24 21 C14 22, 6 28, 8 34 C10 38, 18 36, 24 24"
          fill="url(#wing-left-bottom)"
          opacity="0.7"
        />
        {/* 右上翅 */}
        <path
          d="M24 18 C30 6, 44 2, 46 12 C48 20, 38 24, 24 21"
          fill="url(#wing-right-top)"
          opacity="0.85"
        />
        {/* 右下翅 */}
        <path
          d="M24 21 C34 22, 42 28, 40 34 C38 38, 30 36, 24 24"
          fill="url(#wing-right-bottom)"
          opacity="0.7"
        />
        {/* 身体 */}
        <ellipse cx="24" cy="21" rx="1.2" ry="6" fill="rgba(186,230,253,0.9)" />
        {/* 触角 */}
        <path d="M24 15 Q21 10, 19 8" stroke="rgba(186,230,253,0.5)" strokeWidth="0.6" fill="none" />
        <path d="M24 15 Q27 10, 29 8" stroke="rgba(186,230,253,0.5)" strokeWidth="0.6" fill="none" />
        <circle cx="19" cy="8" r="0.8" fill="rgba(103,232,249,0.7)" />
        <circle cx="29" cy="8" r="0.8" fill="rgba(103,232,249,0.7)" />
        {/* 翅膀纹路 */}
        <path d="M24 19 C18 12, 8 10, 6 14" stroke="rgba(255,255,255,0.12)" strokeWidth="0.4" fill="none" />
        <path d="M24 19 C30 12, 40 10, 42 14" stroke="rgba(255,255,255,0.12)" strokeWidth="0.4" fill="none" />

        <defs>
          <linearGradient id="wing-left-top" x1="2" y1="6" x2="24" y2="21">
            <stop offset="0%" stopColor="rgba(34,211,238,0.9)" />
            <stop offset="50%" stopColor="rgba(56,189,248,0.7)" />
            <stop offset="100%" stopColor="rgba(96,165,250,0.4)" />
          </linearGradient>
          <linearGradient id="wing-left-bottom" x1="6" y1="28" x2="24" y2="24">
            <stop offset="0%" stopColor="rgba(34,211,238,0.6)" />
            <stop offset="100%" stopColor="rgba(56,189,248,0.3)" />
          </linearGradient>
          <linearGradient id="wing-right-top" x1="46" y1="6" x2="24" y2="21">
            <stop offset="0%" stopColor="rgba(34,211,238,0.9)" />
            <stop offset="50%" stopColor="rgba(56,189,248,0.7)" />
            <stop offset="100%" stopColor="rgba(96,165,250,0.4)" />
          </linearGradient>
          <linearGradient id="wing-right-bottom" x1="42" y1="28" x2="24" y2="24">
            <stop offset="0%" stopColor="rgba(34,211,238,0.6)" />
            <stop offset="100%" stopColor="rgba(56,189,248,0.3)" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}

