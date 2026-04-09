"use client";

import { motion } from "framer-motion";
import { Anchor, BarChart3, Brain, ChevronLeft, Code2, FileText, Gamepad2, Server, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { domainMeta, initialRoadmaps, type NodeCategory } from "@/lib/data/initialRoadmaps";
import { renderSummaryMarkdown } from "@/lib/summaryMarkdown";

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
  title?: string;
  content: string;
  contentHtml?: string;
  excerpt?: string;
  period: string;
  createdAt: string;
  updatedAt?: string;
  category?: string | null;
}

export default function Sidebar({ activeDomain, onSelectDomain }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [summaryTab, setSummaryTab] = useState<"weekly" | "monthly" | "domain">("weekly");
  const [summaries, setSummaries] = useState<Summary[]>([]);

  useEffect(() => {
    const query = summaryTab === "domain" ? `?type=domain&category=${activeDomain}` : `?type=${summaryTab}`;
    fetch(`/api/internal/sync-summary${query}`)
      .then((r) => r.json())
      .then((d) => setSummaries(d.summaries || []))
      .catch(() => setSummaries([]));
  }, [summaryTab, activeDomain]);

  const totalNodes = useMemo(() => initialRoadmaps.filter((n) => n.depth > 0).length, []);
  const activeNodes = useMemo(() => initialRoadmaps.filter((n) => n.category === activeDomain && n.depth > 0).length, [activeDomain]);

  return (
    <motion.aside
      className="relative z-30 hidden h-[calc(100vh-40px)] shrink-0 flex-col overflow-hidden rounded-[22px] border border-white/[0.08] bg-[rgba(8,15,29,0.86)] backdrop-blur-xl lg:flex"
      animate={{ width: collapsed ? 94 : 308 }}
      transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] as const }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/25 to-transparent" />

      <div className="flex items-center justify-between px-6 pb-4 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-cyan-300/16 bg-cyan-300/8">
            <Anchor size={18} className="text-cyan-200" />
          </div>
          {!collapsed && (
            <div className="pr-2">
              <p className="text-[15px] font-semibold text-white/92">黑海岸</p>
              <p className="mt-0.5 font-mono text-[10px] tracking-[0.1em] text-cyan-200/55">Knowledge Navigation</p>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.03] text-white/42 transition hover:border-cyan-300/18 hover:text-cyan-200"
          aria-label="切换侧边栏"
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronLeft size={15} />
          </motion.div>
        </button>
      </div>

      {!collapsed && (
        <div className="px-5">
          <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-4">
            <p className="text-[12px] font-medium text-white/68">当前领域概览</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
              <div className="rounded-[14px] bg-white/[0.03] px-3 py-3">
                <p className="text-white/46">总节点</p>
                <p className="mt-1.5 text-base font-semibold text-white">{totalNodes}</p>
              </div>
              <div className="rounded-[14px] bg-white/[0.03] px-3 py-3">
                <p className="text-white/46">当前领域</p>
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
              className={`group relative overflow-hidden rounded-[18px] border px-3.5 py-3 text-left transition ${active ? "border-cyan-300/18 bg-cyan-300/10" : "border-transparent bg-white/[0.03] hover:bg-white/[0.05]"}`}
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-white/[0.05]">
                  <Icon size={16} className={active ? "text-cyan-200" : "text-white/72"} />
                </div>
                {!collapsed && (
                  <div className="min-w-0 pr-2">
                    <p className={`text-[15px] font-semibold leading-5 ${active ? "text-white" : "text-white/84"}`}>{domainMeta[key].label}</p>
                    <p className="mt-1.5 truncate text-[12px] leading-5 text-white/56">{domainMeta[key].description}</p>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="mt-5 flex min-h-0 flex-1 flex-col px-4 pb-4">
          <div className="rounded-[18px] border border-white/8 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="pr-2">
                <p className="text-[12px] font-medium text-white/68">学习摘要</p>
                <p className="mt-0.5 text-[11px] leading-5 text-white/38">作为辅助信息存在，不和导航争夺主视线。</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-white/60">
                <BarChart3 size={16} />
              </div>
            </div>

            <div className="mt-3 inline-flex rounded-full border border-white/8 bg-white/[0.03] p-1">
              {[
                { key: "weekly", label: "周报" },
                { key: "monthly", label: "月报" },
                { key: "domain", label: "领域" },
              ].map((tab) => {
                const active = summaryTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setSummaryTab(tab.key as typeof summaryTab)}
                    className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition ${active ? "bg-cyan-300 text-slate-950" : "text-white/56 hover:text-white/84"}`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 space-y-2.5 overflow-y-auto pr-1">
              {summaries.length === 0 ? (
                <div className="rounded-[14px] bg-white/[0.03] px-4 py-5 text-center">
                  <FileText size={16} className="mx-auto text-white/28" />
                  <p className="mt-2 text-[12px] text-white/50">暂无同步摘要</p>
                </div>
              ) : (
                summaries.slice(0, 2).map((summary) => (
                  <article key={summary.id} className="rounded-[14px] bg-white/[0.03] px-4 py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 pr-2">
                        <p className="text-[13px] font-semibold leading-6 text-white">{summary.title || summary.period}</p>
                        <p className="text-[11px] text-cyan-200/70">{summaryTab === "domain" ? domainMeta[activeDomain].label : summary.period}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-white/[0.05] px-2.5 py-1 text-[10px] text-white/55">
                        {new Date(summary.updatedAt || summary.createdAt).toLocaleDateString("zh-CN")}
                      </span>
                    </div>
                    <div
                      className="summary-prose mt-3 text-[12px] leading-6 text-white/72"
                      dangerouslySetInnerHTML={{ __html: summary.contentHtml || renderSummaryMarkdown(summary.content) }}
                    />
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  );
}
