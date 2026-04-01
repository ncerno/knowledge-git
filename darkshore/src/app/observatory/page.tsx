"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Orbit, Telescope } from "lucide-react";
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
  { label: "总节点", key: "total" as const, tone: "text-white/88" },
  { label: "已点亮", key: "notedCount" as const, tone: "text-cyan-300" },
  { label: "笔记数", key: "totalNotes" as const, tone: "text-white/88" },
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
    <div className="mx-auto flex min-h-screen w-full max-w-[1440px] gap-5 px-5 py-5 lg:gap-6 lg:px-6 lg:py-6 xl:gap-7 xl:px-7">
      <Sidebar activeDomain={activeDomain} onSelectDomain={setActiveDomain} />

      <section className="flex min-w-0 flex-1 flex-col gap-5 lg:gap-6 xl:gap-7">
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="shore-panel px-6 py-5 sm:px-7 sm:py-6 lg:px-8 lg:py-7"
        >
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-[780px]">
              <div className="mb-4 flex items-center gap-3 lg:hidden">
                <MobileSidebar activeDomain={activeDomain} onSelectDomain={setActiveDomain} litCount={nodeStats.notedCount} />
                <div className="shore-badge text-[11px] text-white/78">
                  <Telescope size={13} className="text-cyan-300/90" />
                  <span className="font-mono uppercase tracking-[0.1em] text-cyan-200">{domainMeta[activeDomain].label}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-white/[0.07] bg-white/[0.03] text-white/50 transition hover:border-cyan-400/14 hover:text-cyan-300"
                >
                  <ArrowLeft size={15} />
                </Link>
                <div>
                  <h1 className="pr-3 text-[1.8rem] font-semibold leading-[1.16] tracking-[-0.025em] text-white sm:text-[2rem] lg:text-[2.2rem]">
                    知识星图 · 观测站
                  </h1>
                  <p className="mt-1 font-mono text-[11px] tracking-[0.12em] text-cyan-200/50">
                    Knowledge Graph · Observatory
                  </p>
                </div>
              </div>
              <p className="mt-3 max-w-[660px] text-[14px] leading-7 text-white/68 lg:text-[15px]">
                聚焦一片星域，观察知识节点、笔记沉淀与最近的信号流动。在深海与星潮之间梳理你的学习航线。
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 xl:w-[448px] xl:items-end">
              <GlobalSearch onNavigateNode={handleNavigateNode} />
              <div className="hidden flex-wrap items-center gap-2.5 lg:flex">
                <div className="shore-badge text-[11px] text-white/78">
                  <Telescope size={13} className="text-cyan-300/90" />
                  <span className="font-mono uppercase tracking-[0.1em] text-cyan-200">{domainMeta[activeDomain].label}</span>
                </div>
                <div className="shore-badge text-[11px] text-white/72">
                  <Orbit size={12} className="text-white/68" />
                  {nodeStats.notedCount}/{nodeStats.total} 已点亮
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        <div className="grid min-w-0 flex-1 grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-6">
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
                  className="shore-card px-4 py-3 transition duration-300 hover:border-cyan-400/12 hover:bg-white/[0.05]"
                >
                  <p className="text-[12px] font-medium tracking-[0.06em] text-white/65">{item.label}</p>
                  <p className={`mt-2 text-[1.5rem] font-semibold tracking-[-0.02em] ${item.tone}`}>{nodeStats[item.key]}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="flex min-w-0 flex-col gap-4 xl:gap-5">
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
  );
}

