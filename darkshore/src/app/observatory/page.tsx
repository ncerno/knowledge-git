"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Compass, Telescope } from "lucide-react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import MobileSidebar from "@/components/MobileSidebar";
import KnowledgeGraph from "@/components/KnowledgeGraph";
import GlobalSearch from "@/components/GlobalSearch";
import ChatPanel from "@/components/ChatPanel";
import Heatmap from "@/components/Heatmap";
import SyncRadar from "@/components/SyncRadar";
import RecentSignals from "@/components/RecentSignals";
import { domainMeta, initialRoadmaps, type NodeCategory } from "@/lib/data/initialRoadmaps";

interface StatsData {
  heatmap: Record<string, number>;
  radar: Record<string, number>;
  recentNotes: { id: string; title: string; createdAt: string; wordCount: number; node?: { id: string; title: string; category: string } | null }[];
  litNodes?: string[];
  totalNotes?: number;
}

const KPI_META = [
  { label: "总节点", key: "total" as const },
  { label: "已点亮", key: "notedCount" as const },
  { label: "笔记数", key: "totalNotes" as const },
];

export default function ObservatoryPage() {
  const [activeDomain, setActiveDomain] = useState<NodeCategory>("frontend");
  const [highlightNodeId, setHighlightNodeId] = useState<string | null>(null);
  const [litNodeIds] = useState<string[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then((d) => setStats(d)).catch(() => {});
  }, []);

  const nodeStats = useMemo(() => {
    const total = initialRoadmaps.filter((n) => n.depth > 0).length;
    const notedCount = stats?.litNodes?.length || 0;
    const totalNotes = stats?.totalNotes || 0;
    return { total, notedCount, totalNotes };
  }, [stats]);

  const handleNavigateNode = useCallback((nodeId: string, category: NodeCategory) => {
    setActiveDomain(category);
    setHighlightNodeId(nodeId);
    setTimeout(() => setHighlightNodeId(null), 3000);
  }, []);

  return (
    <div className="shore-container py-5 lg:py-6">
      <div className="mx-auto flex max-w-[1360px] gap-5 lg:gap-6">
        <Sidebar activeDomain={activeDomain} onSelectDomain={setActiveDomain} />

        <section className="flex min-w-0 flex-1 flex-col gap-5 lg:gap-6">
          <motion.header
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="shore-panel px-6 py-6 sm:px-8 sm:py-7"
          >
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-[780px]">
                <div className="mb-4 flex items-center gap-3 lg:hidden">
                  <MobileSidebar activeDomain={activeDomain} onSelectDomain={setActiveDomain} litCount={nodeStats.notedCount} />
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href="/"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-white/50 transition hover:border-cyan-300/24 hover:text-cyan-100"
                  >
                    <ArrowLeft size={15} />
                  </Link>
                  <div>
                    <p className="shore-eyebrow">Observatory</p>
                    <h1 className="mt-2 text-[1.9rem] font-semibold leading-[1.14] tracking-[-0.03em] text-white sm:text-[2.2rem]">
                      知识观测站
                    </h1>
                  </div>
                </div>
                <p className="mt-4 max-w-[700px] text-[14px] leading-7 text-white/64 sm:text-[15px]">
                  这里是黑海岸的特色空间：用知识星图和领域统计来理解结构，而不是替代首页的内容阅读路径。
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 xl:w-[420px] xl:items-end">
                <GlobalSearch onNavigateNode={handleNavigateNode} />
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="shore-badge text-[11px] text-white/78">
                    <Telescope size={13} className="text-cyan-300/90" />
                    <span className="font-mono uppercase tracking-[0.1em] text-cyan-200">{domainMeta[activeDomain].label}</span>
                  </div>
                  <div className="shore-badge text-[11px] text-white/70">
                    <Compass size={12} className="text-white/60" />
                    {nodeStats.notedCount}/{nodeStats.total} 已点亮
                  </div>
                </div>
              </div>
            </div>
          </motion.header>

          <div className="grid min-w-0 flex-1 grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="flex min-w-0 flex-col gap-4">
              <div className="shore-panel min-h-[560px] p-3 lg:p-4">
                <KnowledgeGraph
                  key={`${activeDomain}:${highlightNodeId ?? "none"}`}
                  activeDomain={activeDomain}
                  highlightNodeId={highlightNodeId}
                  litNodeIds={litNodeIds}
                  notedNodeIds={stats?.litNodes || []}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {KPI_META.map((item) => (
                  <div key={item.label} className="shore-card px-5 py-4">
                    <p className="text-[12px] font-medium tracking-[0.06em] text-white/58">{item.label}</p>
                    <p className="mt-2 text-[1.65rem] font-semibold tracking-[-0.03em] text-white">{nodeStats[item.key]}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="flex min-w-0 flex-col gap-4">
              <div className="shore-panel p-4">
                <Heatmap data={stats?.heatmap || {}} />
              </div>
              <div className="shore-panel p-4">
                <SyncRadar data={stats?.radar || {}} />
              </div>
              <div className="shore-panel p-4">
                <RecentSignals notes={stats?.recentNotes || []} />
              </div>
            </aside>
          </div>
        </section>

        <ChatPanel />
      </div>
    </div>
  );
}
