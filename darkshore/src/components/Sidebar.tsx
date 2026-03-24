"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Settings, Anchor, ChevronLeft } from "lucide-react";
import { useState } from "react";
import TaskCenter from "./TaskCenter";
import { domainMeta, type NodeCategory } from "@/lib/data/initialRoadmaps";

interface SidebarProps {
  activeDomain: NodeCategory;
  onSelectDomain: (domain: NodeCategory) => void;
  onTaskComplete?: (relatedNodeId: string) => void;
}

const DOMAINS: { key: NodeCategory; emoji: string }[] = [
  { key: "frontend", emoji: "🌊" },
  { key: "backend", emoji: "⚓" },
  { key: "ai", emoji: "✨" },
  { key: "gamedev", emoji: "🎮" },
  { key: "python", emoji: "🐍" },
];

export default function Sidebar({ activeDomain, onSelectDomain, onTaskComplete }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      className="relative z-30 flex h-full flex-shrink-0 flex-col"
      animate={{ width: collapsed ? 64 : 260 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        background: "rgba(10, 16, 30, 0.72)",
        backdropFilter: "blur(16px) saturate(1.5)",
        WebkitBackdropFilter: "blur(16px) saturate(1.5)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* 顶部青色光条 */}
      <div
        className="absolute left-0 right-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.5), transparent)" }}
      />

      {/* Logo */}
      <div className="mb-2 flex items-center gap-3 px-4 py-5">
        <motion.div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
          style={{
            background: "linear-gradient(135deg, rgba(0,229,255,0.2), rgba(59,130,246,0.15))",
            border: "1px solid rgba(0,229,255,0.35)",
          }}
          animate={{ boxShadow: ["0 0 8px rgba(0,229,255,0.15)", "0 0 18px rgba(0,229,255,0.35)", "0 0 8px rgba(0,229,255,0.15)"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Anchor size={14} className="text-cyan-400" />
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="overflow-hidden">
              <p className="text-xs font-bold leading-tight tracking-wider text-white/90">黑海岸</p>
              <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-cyan-400/70">Dark Shore</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 星域导航 */}
      <div className="px-2">
        {!collapsed && <p className="mb-2 px-2 font-mono text-[9px] uppercase tracking-[0.22em] text-white/25">星域</p>}
        <nav className="flex flex-col gap-0.5">
          {DOMAINS.map(({ key, emoji }) => {
            const isActive = activeDomain === key;
            const meta = domainMeta[key];
            return (
              <motion.button
                key={key}
                onClick={() => onSelectDomain(key)}
                className="group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left"
                style={{
                  background: isActive ? "rgba(0,229,255,0.1)" : "rgba(0,0,0,0)",
                  border: isActive ? "1px solid rgba(0,229,255,0.2)" : "1px solid rgba(0,0,0,0)",
                }}
                whileHover={{ background: "rgba(0,229,255,0.07)" }}
                transition={{ duration: 0.15 }}
              >
                {isActive && (
                  <motion.div layoutId="domain-indicator" className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full" style={{ background: "linear-gradient(to bottom, #00e5ff, #3b82f6)" }} />
                )}
                <span className="shrink-0 text-sm">{emoji}</span>
                {!collapsed && (
                  <div className="min-w-0 overflow-hidden">
                    <p className={`truncate text-xs font-medium ${isActive ? "text-white" : "text-white/60 group-hover:text-white/85"}`}>{meta.label}</p>
                    <p className="truncate font-mono text-[9px] text-white/25">{meta.description}</p>
                  </div>
                )}
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* 守望清单 */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 flex-1 overflow-y-auto border-t border-white/[0.06] px-3 pt-4">
            <TaskCenter onTaskComplete={onTaskComplete} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 底部 */}
      <div className="mt-2 flex flex-col gap-1 border-t border-white/[0.06] px-2 pb-4 pt-3">
        <motion.button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-white/40 hover:text-white/70" whileHover={{ background: "rgba(255,255,255,0.04)" }}>
          <Settings size={15} />
          {!collapsed && <span className="text-xs font-medium">系统设置</span>}
        </motion.button>
        <motion.button onClick={() => setCollapsed(!collapsed)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-white/25 hover:text-cyan-400/70" whileHover={{ background: "rgba(0,229,255,0.04)" }}>
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronLeft size={14} />
          </motion.div>
          {!collapsed && <span className="font-mono text-[10px] tracking-wider text-white/25">COLLAPSE</span>}
        </motion.button>
      </div>
    </motion.aside>
  );
}
