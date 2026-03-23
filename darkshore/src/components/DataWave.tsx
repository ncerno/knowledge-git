"use client";

import { motion } from "framer-motion";

interface DataWaveProps {
  /** 条数，默认 7 */
  bars?: number;
  /** 高度，默认 h-8 */
  height?: string;
  /** 颜色主题 */
  color?: "cyan" | "blue" | "white";
  /** 标签文字 */
  label?: string;
  className?: string;
}

const colorMap = {
  cyan: {
    bar: "#00e5ff",
    glow: "rgba(0,229,255,0.5)",
    dim: "rgba(0,229,255,0.2)",
    text: "text-cyan-400",
  },
  blue: {
    bar: "#3b82f6",
    glow: "rgba(59,130,246,0.5)",
    dim: "rgba(59,130,246,0.2)",
    text: "text-blue-400",
  },
  white: {
    bar: "rgba(255,255,255,0.9)",
    glow: "rgba(255,255,255,0.4)",
    dim: "rgba(255,255,255,0.15)",
    text: "text-white/70",
  },
};

export default function DataWave({
  bars = 7,
  height = "h-8",
  color = "cyan",
  label,
  className = "",
}: DataWaveProps) {
  const theme = colorMap[color];

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {/* 波形条 */}
      <div className={`flex items-end gap-[3px] ${height}`}>
        {Array.from({ length: bars }).map((_, i) => {
          const delay = (i / bars) * 0.6;
          const peakHeight = 30 + Math.sin((i / bars) * Math.PI) * 55;

          return (
            <motion.div
              key={i}
              className="w-[3px] rounded-full origin-bottom"
              style={{
                background: `linear-gradient(to top, ${theme.dim}, ${theme.bar})`,
                boxShadow: `0 0 6px ${theme.glow}`,
                height: "30%",
              }}
              animate={{
                scaleY: [0.2, 1, 0.2],
                opacity: [0.4, 1, 0.4],
                height: ["20%", `${peakHeight}%`, "20%"],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </div>

      {/* 底部扫描线 */}
      <div className="relative w-full max-w-[120px] h-px overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: theme.dim }}
        />
        <motion.div
          className="absolute top-0 h-px w-8"
          style={{
            background: `linear-gradient(90deg, transparent, ${theme.bar}, transparent)`,
          }}
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* 标签 */}
      {label && (
        <motion.p
          className={`text-[10px] font-mono tracking-[0.2em] uppercase ${theme.text}`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {label}
        </motion.p>
      )}
    </div>
  );
}

