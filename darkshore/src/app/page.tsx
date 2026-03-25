"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Orbit, Telescope } from "lucide-react";
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
  litNodes: string[];
  totalNotes: number;
}

const KPI_META = [
  { label: "总节点", key: "total" as const, tone: "text-white/88" },
  { label: "已点亮", key: "notedCount" as const, tone: "text-cyan-300" },
  { label: "笔记数", key: "totalNotes" as const, tone: "text-white/88" },
];

export default function HomePage() {
  const [activeDomain, setActiveDomain] = useState<NodeCategory>("frontend");
  const [highlightNodeId, setHighlightNodeId] = useState<string | null>(null);
  const [litNodeIds, setLitNodeIds] = useState<string[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then((d) => setStats(d)).catch(() => {});
  }, []);

  const nodeStats = useMemo(() => {
    const total = initialRoadmaps.filter((n) => n.depth > 0).length;
    const notedCount = stats?.litNodes.length || 0;
    const totalNotes = stats?.totalNotes || 0;
    return { total, notedCount, totalNotes };
  }, [stats]);

  const handleNavigateNode = useCallback((nodeId: string, category: NodeCategory) => {
    setActiveDomain(category);
    setHighlightNodeId(nodeId);
    setTimeout(() => setHighlightNodeId(null), 3000);
  }, []);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1720px] gap-5 px-5 py-5 lg:gap-6 lg:px-6 lg:py-6 xl:gap-7 xl:px-7">
      <Sidebar activeDomain={activeDomain} onSelectDomain={setActiveDomain} />

      <section className="flex min-w-0 flex-1 flex-col gap-5 lg:gap-6 xl:gap-7">
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="shore-panel px-6 py-6 sm:px-7 sm:py-7 lg:px-8 lg:py-8"
        >
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-[780px]">
              <div className="mb-4 flex items-center gap-3 lg:hidden">
                <MobileSidebar activeDomain={activeDomain} onSelectDomain={setActiveDomain} litCount={nodeStats.notedCount} />
                <div className="shore-badge min-h-10 text-[11px] text-white/78 backdrop-blur-md">
                  <Telescope size={13} className="text-cyan-300/90" />
                  <span className="font-mono uppercase tracking-[0.12em] text-cyan-200">{domainMeta[activeDomain].label}</span>
                </div>
              </div>
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-200/70">Darkshore · Knowledge Observatory</p>
              <h1 className="pr-3 text-[2.15rem] font-semibold leading-[1.16] tracking-[-0.025em] text-white sm:text-[2.35rem] lg:text-[2.8rem]">黑海岸 · 守望站</h1>
              <p className="mt-4 max-w-[660px] text-[15px] leading-7 text-white/72 lg:text-[16px]">
                在深海与星潮之间梳理你的学习航线。聚焦一片星域，观察知识节点、笔记沉淀与最近的信号流动。
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 xl:w-[448px] xl:items-end">
              <GlobalSearch onNavigateNode={handleNavigateNode} />
              <div className="hidden flex-wrap items-center gap-3 lg:flex">
                <div className="shore-badge min-h-10 text-[11px] text-white/78 backdrop-blur-md">
                  <Telescope size={13} className="text-cyan-300/90" />
                  <span className="font-mono uppercase tracking-[0.12em] text-cyan-200">{domainMeta[activeDomain].label}</span>
                </div>
                <div className="shore-badge min-h-10 text-[11px] text-white/76">
                  <Orbit size={12} className="text-white/72" />
                  {nodeStats.notedCount}/{nodeStats.total} 已点亮
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        <div className="grid min-w-0 flex-1 grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_332px] xl:gap-6">
          <div className="flex min-w-0 flex-col gap-4 xl:gap-5">
            <div className="shore-panel min-h-[520px] p-3 lg:p-4">
              <KnowledgeGraph
                activeDomain={activeDomain}
                highlightNodeId={highlightNodeId}
                litNodeIds={litNodeIds}
                notedNodeIds={stats?.litNodes || []}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {KPI_META.map((item) => (
                <div
                  key={item.label}
                  className="shore-card px-5 py-4 transition duration-300 hover:border-cyan-400/16 hover:bg-white/[0.06]"
                >
                  <p className="text-[12px] font-medium tracking-[0.08em] text-white/62">{item.label}</p>
                  <p className={`mt-3 text-[2rem] font-semibold tracking-[-0.02em] ${item.tone}`}>{nodeStats[item.key]}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="flex min-w-0 flex-col gap-4 xl:gap-5">
            <div className="shore-panel p-5">
              <Heatmap data={stats?.heatmap || {}} />
            </div>
            <div className="shore-panel p-5">
              <SyncRadar data={stats?.radar || {}} />
            </div>
            <div className="shore-panel p-5">
              <RecentSignals notes={stats?.recentNotes || []} />
            </div>
          </aside>
        </div>
      </section>

      <ChatPanel />
    </div>
  );
}
