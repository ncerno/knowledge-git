"use client";

import { motion } from "framer-motion";
import {
  Compass,
  BookOpen,
  Star,
  Map,
  Network,
  Settings,
  Activity,
  Anchor,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { icon: Compass,  label: "守望台",   href: "/",         desc: "Dashboard" },
  { icon: BookOpen, label: "知识航海", href: "/notes",    desc: "Notes" },
  { icon: Star,     label: "星图路径", href: "/roadmap",  desc: "Roadmap" },
  { icon: Map,      label: "领域地图", href: "/domains",  desc: "Domains" },
  { icon: Network,  label: "知识星图", href: "/graph",    desc: "Graph" },
  { icon: Activity, label: "学习脉冲", href: "/stats",    desc: "Stats" },
];

export default function Sidebar() {
  const [active, setActive] = useState("/");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      className="relative flex-shrink-0 flex flex-col h-full z-30"
      animate={{ width: collapsed ? 64 : 220 }}
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
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.5), transparent)" }}
      />

      {/* Logo 区域 */}
      <div className="flex items-center gap-3 px-4 py-5 mb-2">
        <motion.div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(0,229,255,0.2), rgba(59,130,246,0.15))",
            border: "1px solid rgba(0,229,255,0.35)",
            boxShadow: "0 0 12px rgba(0,229,255,0.2)",
          }}
          animate={{ boxShadow: ["0 0 8px rgba(0,229,255,0.15)", "0 0 18px rgba(0,229,255,0.35)", "0 0 8px rgba(0,229,255,0.15)"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Anchor size={14} className="text-cyan-400" />
        </motion.div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="overflow-hidden"
          >
            <p className="text-xs font-bold text-white/90 tracking-wider leading-tight">黑海岸</p>
            <p className="text-[9px] text-cyan-400/70 tracking-[0.15em] uppercase font-mono">Dark Shore</p>
          </motion.div>
        )}
      </div>

      {/* 导航列表 */}
      <nav className="flex-1 flex flex-col gap-1 px-2 overflow-hidden">
        {NAV_ITEMS.map(({ icon: Icon, label, href, desc }) => {
          const isActive = active === href;
          return (
            <motion.button
              key={href}
              onClick={() => setActive(href)}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left group"
              style={{
                background: isActive ? "rgba(0,229,255,0.1)" : "transparent",
                border: isActive ? "1px solid rgba(0,229,255,0.2)" : "1px solid transparent",
              }}
              whileHover={{ background: "rgba(0,229,255,0.07)", borderColor: "rgba(0,229,255,0.15)" }}
              transition={{ duration: 0.15 }}
            >
              {/* 激活指示条 */}
              {isActive && (
                <motion.div
                  layoutId="active-bar"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                  style={{ background: "linear-gradient(to bottom, #00e5ff, #3b82f6)" }}
                />
              )}
              <Icon
                size={16}
                className={isActive ? "text-cyan-400" : "text-white/40 group-hover:text-white/70"}
                style={isActive ? { filter: "drop-shadow(0 0 4px rgba(0,229,255,0.6))" } : {}}
              />
              {!collapsed && (
                <div className="overflow-hidden">
                  <p className={`text-xs font-medium leading-tight ${isActive ? "text-white" : "text-white/60 group-hover:text-white/85"}`}>
                    {label}
                  </p>
                  <p className="text-[9px] text-white/25 font-mono uppercase tracking-wider">{desc}</p>
                </div>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* 底部设置 & 折叠 */}
      <div className="px-2 pb-4 flex flex-col gap-1 border-t border-white/[0.06] pt-3 mt-2">
        <motion.button
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/40 hover:text-white/70 w-full"
          whileHover={{ background: "rgba(255,255,255,0.04)" }}
        >
          <Settings size={15} />
          {!collapsed && <span className="text-xs font-medium">系统设置</span>}
        </motion.button>
        <motion.button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/25 hover:text-cyan-400/70 w-full"
          whileHover={{ background: "rgba(0,229,255,0.04)" }}
        >
          <motion.div animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: 0.3 }}>
            <Compass size={13} />
          </motion.div>
          {!collapsed && <span className="text-[10px] font-mono text-white/25 tracking-wider">COLLAPSE</span>}
        </motion.button>
      </div>
    </motion.aside>
  );
}

