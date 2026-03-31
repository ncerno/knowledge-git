"use client";

import { motion } from "framer-motion";

/**
 * 守岸人标志性蓝蝴蝶 — 参考鸣潮WIKI视觉风格重新设计
 * 更精致的翅膀轮廓、多层渐变叠加、光效粒子装饰、声骸纹路细节
 * 整体更符合鸣潮官方的高质感暗色+青蓝光效美学
 */
export default function ShoreButterfly({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`pointer-events-none relative select-none ${className}`}
      animate={{ y: [0, -5, 0], rotate: [-1.5, 2, -1.5] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* 外层光晕 */}
      <div className="absolute inset-0 -m-3 rounded-full bg-cyan-400/[0.06] blur-xl" />

      <svg
        width="56"
        height="50"
        viewBox="0 0 56 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative drop-shadow-[0_0_18px_rgba(34,211,238,0.25)]"
      >
        {/* ===== 左上翅（主翅）===== */}
        <path
          d="M28 22 C22 10, 10 4, 4 10 C0 16, 4 22, 12 24 C16 25, 22 24, 28 22"
          fill="url(#sb-wing-lt)"
          opacity="0.88"
        />
        {/* 左上翅内层光效 */}
        <path
          d="M28 22 C24 14, 14 8, 8 12 C5 16, 8 20, 16 23 C20 24, 24 23, 28 22"
          fill="url(#sb-inner-lt)"
          opacity="0.4"
        />

        {/* ===== 左下翅 ===== */}
        <path
          d="M28 24 C20 26, 10 30, 8 38 C7 42, 14 42, 20 36 C24 32, 26 28, 28 24"
          fill="url(#sb-wing-lb)"
          opacity="0.72"
        />

        {/* ===== 右上翅（主翅）===== */}
        <path
          d="M28 22 C34 10, 46 4, 52 10 C56 16, 52 22, 44 24 C40 25, 34 24, 28 22"
          fill="url(#sb-wing-rt)"
          opacity="0.88"
        />
        {/* 右上翅内层光效 */}
        <path
          d="M28 22 C32 14, 42 8, 48 12 C51 16, 48 20, 40 23 C36 24, 32 23, 28 22"
          fill="url(#sb-inner-rt)"
          opacity="0.4"
        />

        {/* ===== 右下翅 ===== */}
        <path
          d="M28 24 C36 26, 46 30, 48 38 C49 42, 42 42, 36 36 C32 32, 30 28, 28 24"
          fill="url(#sb-wing-rb)"
          opacity="0.72"
        />

        {/* ===== 翅膀脉络纹路（声骸纹理风格）===== */}
        <path d="M28 22 C22 14, 12 10, 6 12" stroke="rgba(186,230,253,0.15)" strokeWidth="0.5" fill="none" />
        <path d="M28 22 C20 16, 10 14, 8 18" stroke="rgba(186,230,253,0.1)" strokeWidth="0.4" fill="none" />
        <path d="M28 22 C34 14, 44 10, 50 12" stroke="rgba(186,230,253,0.15)" strokeWidth="0.5" fill="none" />
        <path d="M28 22 C36 16, 46 14, 48 18" stroke="rgba(186,230,253,0.1)" strokeWidth="0.4" fill="none" />
        {/* 下翅脉络 */}
        <path d="M28 24 C22 28, 14 34, 12 38" stroke="rgba(186,230,253,0.1)" strokeWidth="0.35" fill="none" />
        <path d="M28 24 C34 28, 42 34, 44 38" stroke="rgba(186,230,253,0.1)" strokeWidth="0.35" fill="none" />

        {/* ===== 身体 ===== */}
        <ellipse cx="28" cy="24" rx="1.3" ry="7" fill="url(#sb-body)" />

        {/* ===== 触角 ===== */}
        <path d="M28 17 Q24 10, 20 7" stroke="url(#sb-antenna)" strokeWidth="0.7" fill="none" strokeLinecap="round" />
        <path d="M28 17 Q32 10, 36 7" stroke="url(#sb-antenna)" strokeWidth="0.7" fill="none" strokeLinecap="round" />
        {/* 触角末端光点 */}
        <circle cx="20" cy="7" r="1.1" fill="rgba(103,232,249,0.8)" />
        <circle cx="36" cy="7" r="1.1" fill="rgba(103,232,249,0.8)" />
        <circle cx="20" cy="7" r="2" fill="rgba(103,232,249,0.15)" />
        <circle cx="36" cy="7" r="2" fill="rgba(103,232,249,0.15)" />

        {/* ===== 翅膀上的光点装饰（鸣潮风格粒子）===== */}
        <circle cx="12" cy="14" r="0.8" fill="rgba(186,230,253,0.6)" />
        <circle cx="8" cy="20" r="0.6" fill="rgba(103,232,249,0.5)" />
        <circle cx="16" cy="10" r="0.5" fill="rgba(255,255,255,0.4)" />
        <circle cx="44" cy="14" r="0.8" fill="rgba(186,230,253,0.6)" />
        <circle cx="48" cy="20" r="0.6" fill="rgba(103,232,249,0.5)" />
        <circle cx="40" cy="10" r="0.5" fill="rgba(255,255,255,0.4)" />
        {/* 下翅光点 */}
        <circle cx="14" cy="34" r="0.5" fill="rgba(103,232,249,0.4)" />
        <circle cx="42" cy="34" r="0.5" fill="rgba(103,232,249,0.4)" />

        <defs>
          {/* 左上翅渐变 */}
          <linearGradient id="sb-wing-lt" x1="2" y1="6" x2="28" y2="24">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
            <stop offset="45%" stopColor="#38bdf8" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.35" />
          </linearGradient>
          {/* 左上翅内层高光 */}
          <radialGradient id="sb-inner-lt" cx="0.3" cy="0.4" r="0.6">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
          {/* 左下翅渐变 */}
          <linearGradient id="sb-wing-lb" x1="8" y1="30" x2="28" y2="24">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.25" />
          </linearGradient>
          {/* 右上翅渐变 */}
          <linearGradient id="sb-wing-rt" x1="54" y1="6" x2="28" y2="24">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
            <stop offset="45%" stopColor="#38bdf8" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.35" />
          </linearGradient>
          {/* 右上翅内层高光 */}
          <radialGradient id="sb-inner-rt" cx="0.7" cy="0.4" r="0.6">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
          {/* 右下翅渐变 */}
          <linearGradient id="sb-wing-rb" x1="48" y1="30" x2="28" y2="24">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.25" />
          </linearGradient>
          {/* 身体渐变 */}
          <linearGradient id="sb-body" x1="28" y1="17" x2="28" y2="31">
            <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#67e8f9" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.6" />
          </linearGradient>
          {/* 触角渐变 */}
          <linearGradient id="sb-antenna" x1="28" y1="17" x2="20" y2="7">
            <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.9" />
          </linearGradient>
        </defs>
      </svg>

      {/* 动态光粒子（CSS动画替代额外JS） */}
      <motion.div
        className="absolute -right-1 top-1 h-1 w-1 rounded-full bg-cyan-300/60"
        animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -left-0.5 top-3 h-0.5 w-0.5 rounded-full bg-cyan-200/50"
        animate={{ opacity: [0.2, 0.7, 0.2], scale: [1, 1.4, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />
    </motion.div>
  );
}
