"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Settings, Anchor, ChevronLeft, FileText, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import { domainMeta, type NodeCategory } from "@/lib/data/initialRoadmaps";

interface SidebarProps {
  activeDomain: NodeCategory;
  onSelectDomain: (d: NodeCategory) => void;
}

const DOMAINS: { key: NodeCategory; emoji: string }[] = [
  { key: "frontend", emoji: "🌊" },
  { key: "backend", emoji: "⚓" },
  { key: "ai", emoji: "✨" },
  { key: "gamedev", emoji: "🎮" },
  { key: "python", emoji: "🐍" },
];

interface Summary { id: string; content: string; period: string; createdAt: string }

export default function Sidebar({ activeDomain, onSelectDomain }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [summaryTab, setSummaryTab] = useState<"weekly" | "monthly" | "domain">("weekly");
  const [summaries, setSummaries] = useState<Summary[]>([]);

  useEffect(() => {
    fetch(`/api/internal/sync-summary?type=${summaryTab}`)
      .then((r) => r.json())
      .then((d) => setSummaries(d.summaries || []))
      .catch(() => setSummaries([]));
  }, [summaryTab]);

  return (
    <motion.aside
      className="relative z-30 flex h-full flex-shrink-0 flex-col"
      animate={{ width: collapsed ? 68 : 272 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        background: "rgba(10,16,30,0.72)",
        backdropFilter: "blur(20px) saturate(1.5)",
        WebkitBackdropFilter: "blur(20px) saturate(1.5)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="absolute left-0 right-0 top-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(0,229,255,0.45),transparent)" }} />

      {/* Logo */}
      <div className="mb-3 flex items-center gap-3 px-5 pt-6 pb-2">
        <motion.div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ background: "linear-gradient(135deg,rgba(0,229,255,0.2),rgba(59,130,246,0.15))", border: "1px solid rgba(0,229,255,0.3)" }}
          animate={{ boxShadow: ["0 0 8px rgba(0,229,255,0.15)", "0 0 20px rgba(0,229,255,0.35)", "0 0 8px rgba(0,229,255,0.15)"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Anchor size={15} className="text-cyan-400" />
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="overflow-hidden">
              <p className="text-sm font-bold leading-tight tracking-wider text-white/90">黑海岸</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-400/65">Dark Shore</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 星域导航 */}
      <div className="px-3">
        {!collapsed && (
          <p className="mb-2 px-2 font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-400/40 glow-breathe">
            ✦ 星域
          </p>
        )}
        <nav className="flex flex-col gap-1">
          {DOMAINS.map(({ key, emoji }) => {
            const active = activeDomain === key;
            const meta = domainMeta[key];
            return (
              <motion.button
                key={key}
                onClick={() => onSelectDomain(key)}
                className="group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left"
                style={{
                  background: active ? "rgba(0,229,255,0.1)" : "rgba(0,0,0,0)",
                  border: active ? "1px solid rgba(0,229,255,0.18)" : "1px solid rgba(0,0,0,0)",
                }}
                whileHover={{ background: "rgba(0,229,255,0.06)" }}
                transition={{ duration: 0.15 }}
              >
                {active && (
                  <motion.div
                    layoutId="domain-bar"
                    className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full"
                    style={{ background: "linear-gradient(to bottom,#00e5ff,#3b82f6)" }}
                  />
                )}
                <span className="shrink-0 text-base">{emoji}</span>
                {!collapsed && (
                  <div className="min-w-0 overflow-hidden">
                    <p className={`truncate text-[13px] font-medium ${active ? "text-white" : "text-white/55 group-hover:text-white/85"}`}>
                      {meta.label}
                    </p>
                  </div>
                )}
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* 学习总结（替代守望清单） */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="mt-5 flex-1 overflow-y-auto border-t border-white/[0.05] px-4 pt-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <BarChart3 size={13} className="text-cyan-400/60" />
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-400/40">学习总结</span>
              </div>
            </div>

            {/* Tab 切换 */}
            <div className="mb-3 flex gap-1 rounded-lg bg-white/[0.03] p-0.5">
              {([["weekly", "周报"], ["monthly", "月报"], ["domain", "领域"]] as const).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setSummaryTab(k)}
                  className={`flex-1 rounded-md py-1.5 text-[11px] font-medium transition ${summaryTab === k ? "bg-cyan-400/15 text-cyan-300" : "text-white/35 hover:text-white/55"}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* 总结内容 */}
            <div className="space-y-2">
              {summaries.length === 0 ? (
                <div className="rounded-xl bg-white/[0.02] px-3 py-4 text-center">
                  <FileText size={20} className="mx-auto mb-2 text-white/15" />
                  <p className="text-[11px] text-white/30">暂无{summaryTab === "weekly" ? "周" : summaryTab === "monthly" ? "月" : "领域"}报</p>
                  <p className="mt-1 text-[10px] text-white/20">AI 将自动生成学习总结</p>
                </div>
              ) : (
                summaries.slice(0, 3).map((s) => (
                  <div key={s.id} className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                    <p className="mb-1 font-mono text-[10px] text-cyan-400/50">{s.period}</p>
                    <p className="line-clamp-3 text-[12px] leading-5 text-white/55">{s.content}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 底部 */}
      <div className="mt-auto flex flex-col gap-1 border-t border-white/[0.05] px-3 pb-4 pt-3">
        <motion.button
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-white/35 hover:text-white/65"
          whileHover={{ background: "rgba(255,255,255,0.03)" }}
        >
          <Settings size={15} />
          {!collapsed && <span className="text-[13px]">系统设置</span>}
        </motion.button>
        <motion.button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-white/25 hover:text-cyan-400/60"
          whileHover={{ background: "rgba(0,229,255,0.03)" }}
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronLeft size={14} />
          </motion.div>
          {!collapsed && <span className="font-mono text-[10px] tracking-wider text-white/20">COLLAPSE</span>}
        </motion.button>
      </div>
    </motion.aside>
  );
}