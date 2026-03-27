"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  /** 悬浮时是否显示微光边框效果，默认 true */
  glowOnHover?: boolean;
  /** 卡片内边距，默认 p-5 */
  padding?: string;
  /** 是否显示顶部青色光条 */
  accentBar?: boolean;
}

export default function GlassCard({
  children,
  className = "",
  glowOnHover = true,
  padding = "p-5",
  accentBar = false,
  ...motionProps
}: GlassCardProps) {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-[10px] ${padding} ${className}`}
      style={{
        background: "rgba(13, 21, 38, 0.68)",
        backdropFilter: "blur(12px) saturate(1.3)",
        WebkitBackdropFilter: "blur(12px) saturate(1.3)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={
        glowOnHover
          ? {
              borderColor: "rgba(0, 229, 255, 0.18)",
              boxShadow:
                "0 0 18px rgba(0,229,255,0.08), 0 6px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
              backgroundColor: "rgba(0, 229, 255, 0.03)",
              transition: { duration: 0.25 },
            }
          : undefined
      }
      {...motionProps}
    >
      {/* 顶部装饰光条 */}
      {accentBar && (
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(0,229,255,0.6), rgba(59,130,246,0.4), transparent)",
          }}
        />
      )}

      {/* 右上角微光角标 */}
      <div
        className="absolute top-0 right-0 w-12 h-12 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(0,229,255,0.04), transparent 70%)",
        }}
      />

      {/* 内容 */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

