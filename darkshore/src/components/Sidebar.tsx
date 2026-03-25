"use client";

import { motion } from "framer-motion";
import { Settings, Anchor, ChevronLeft, FileText, BarChart3, Code2, Server, Brain, Gamepad2, Sparkles } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { domainMeta, initialRoadmaps, type NodeCategory } from "@/lib/data/initialRoadmaps";

interface SidebarProps {
  activeDomain: NodeCategory;
  onSelectDomain: (d: NodeCategory) => void;
}

const DOMAINS: { key: NodeCategory; icon: typeof Code2 }[] = [
  { key: "frontend", icon: Code2 },
  { key: "backend", icon: Server },
  { key: "ai", icon: Brain },
  { key: "gamedev", icon: Gamepad2 },
  { key: "python", icon: Sparkles },
];

interface Summary {
  id: string;
  content: string;
  period: string;
  createdAt: string;
}

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

  const totalNodes = useMemo(() => initialRoadmaps.filter((n) => n.depth > 0).length, []);
  const activeNodes = useMemo(() => initialRoadmaps.filter((n) => n.category === activeDomain && n.depth > 0).length, [activeDomain]);

  return (
    <motion.aside
      className="relative z-30 hidden h-[calc(100vh-32px)] shrink-0 flex-col overflow-hidden rounded-[22px] border border-white/[0.05] bg-[rgba(15,22,38,0.84)] backdrop-blur-2xl lg:flex"
      animate={{ width: collapsed ? 88 : 298 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/45 to-transparent" />

      <div className="flex items-center justify-between px-6 pb-4 pt-6">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/18 bg-cyan-400/[0.07] shadow-[0_0_30px_rgba(34,211,238,0.08)]">
            <Anchor size={18} className="text-cyan-300" />
          </div>
          {!collapsed && (
            <div className="pr-2">
              <p className="text-[15px] font-semibold text-white/90">黑海岸</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300/55">Shorekeeper Console</p>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-[16px] border border-white/[0.08] bg-white/[0.03] text-white/42 transition hover:border-cyan-400/15 hover:bg-cyan-400/[0.05] hover:text-cyan-300"
          aria-label="切换侧边栏"
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronLeft size={15} />
          </motion.div>
        </button>
      </div>

      {!collapsed && (
        <div className="px-5">
          <div className="rounded-[18px] bg-white/[0.035] px-5 py-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/56">星域导航</p>
            <p className="mt-3 text-[13px] leading-6 text-white/70">选择一片星域，聚焦当前知识群落与信号流向。</p>
            <div className="mt-4 grid grid-cols-2 gap-2.5 text-[12px] text-white/58">
              <div className="rounded-[16px] bg-white/[0.045] px-3.5 py-3">
                <p className="text-white/58">总节点</p>
                <p className="mt-1.5 text-base font-semibold text-white">{totalNodes}</p>
              </div>
              <div className="rounded-[16px] bg-white/[0.045] px-3.5 py-3">
                <p className="text-white/58">当前领域</p>
                <p className="mt-1.5 text-base font-semibold text-white">{activeNodes}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="mt-5 flex flex-col gap-2.5 px-5">
        {DOMAINS.map(({ key, icon: Icon }) => {
          const active = activeDomain === key;
          return (
            <button
              key={key}
              onClick={() => onSelectDomain(key)}
              className="group relative overflow-hidden rounded-[18px] px-4 py-3.5 text-left transition duration-300"
              style={{
                background: active ? "rgba(56,189,248,0.12)" : "rgba(255,255,255,0.04)",
                border: active ? "1px solid rgba(56,189,248,0.18)" : "1px solid transparent",
              }}
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-white/[0.06]">
                  <Icon size={16} className={active ? "text-cyan-200" : "text-white/72"} />
                </div>
                {!collapsed && (
                  <div className="min-w-0 pr-2">
                    <p className={`text-[15px] font-semibold leading-5 ${active ? "text-white" : "text-white/84"}`}>{domainMeta[key].label}</p>
                    <p className="mt-1.5 truncate text-[12px] leading-5 text-white/64">{domainMeta[key].description}</p>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="mt-5 flex min-h-0 flex-1 flex-col px-4 pb-4">
          <div className="rounded-[18px] bg-white/[0.04] p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="pr-2">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/64">学习摘要</p>
                <p className="mt-1.5 text-[13px] leading-6 text-white/72">以周、月与领域维度同步守望记录。</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white/[0.05] text-white/70">
                <BarChart3 size={16} />
              </div>
            </div>

            <div className="mt-4 inline-flex rounded-[16px] bg-white/[0.05] p-1">
              {[
                { key: "weekly", label: "周" },
                { key: "monthly", label: "月" },
                { key: "domain", label: "域" },
              ].map((tab) => {
                const active = summaryTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setSummaryTab(tab.key as typeof summaryTab)}
                    className={`rounded-[12px] px-3.5 py-2 text-[12px] font-medium transition ${active ? "bg-cyan-400/[0.14] text-cyan-100" : "text-white/62 hover:text-white/88"}`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 space-y-3">
              {summaries.length === 0 ? (
                <div className="rounded-[16px] bg-white/[0.045] px-4 py-5 text-center">
                  <FileText size={16} className="mx-auto text-white/35" />
                  <p className="mt-2 text-[12px] text-white/60">暂无同步摘要</p>
                </div>
              ) : (
                summaries.slice(0, 2).map((summary) => (
                  <div key={summary.id} className="rounded-[16px] bg-white/[0.05] px-4 py-4">
                    <p className="line-clamp-3 text-[13px] leading-6 text-white/80">{summary.content}</p>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-white/56">
                      <span>{summary.period}</span>
                      <span>{new Date(summary.createdAt).toLocaleDateString("zh-CN")}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-auto border-t border-white/[0.05] px-4 py-4">
        <button className="flex w-full items-center gap-3 rounded-[16px] bg-white/[0.045] px-4 py-3 text-left text-white/72 transition hover:bg-cyan-400/[0.08] hover:text-white">
          <Settings size={15} />
          {!collapsed && <span className="text-sm font-medium">系统设置</span>}
        </button>
      </div>
    </motion.aside>
  );
}
