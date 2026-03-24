"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
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

export default function HomePage() {
  const [activeDomain, setActiveDomain] = useState<NodeCategory>("frontend");
  const [highlightNodeId, setHighlightNodeId] = useState<string | null>(null);
  const [litNodeIds, setLitNodeIds] = useState<string[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    fetch("/api/stats").then(r => r.json()).then(d => setStats(d)).catch(() => {});
  }, []);

  const nodeStats = useMemo(() => {
    const total = initialRoadmaps.filter(n => n.depth > 0).length;
    const notedCount = stats?.litNodes.length || 0;
    return { total, notedCount };
  }, [stats]);

  const handleNavigateNode = useCallback((nodeId: string, category: NodeCategory) => {
    setActiveDomain(category);
    setHighlightNodeId(nodeId);
    setTimeout(() => setHighlightNodeId(null), 3000);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activeDomain={activeDomain} onSelectDomain={setActiveDomain} />

      <div className="flex min-w-0 flex-1 flex-col gap-5 overflow-y-auto p-5 lg:p-7">
        <div className="flex items-center justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.3em] text-cyan-300/55">
              Darkshore · Knowledge Observatory
            </p>
            <h1 className="text-[26px] font-bold tracking-tight text-white/92 lg:text-[30px]">
              黑海岸 · 守望站
            </h1>
          </motion.div>
          <div className="flex items-center gap-3">
            <GlobalSearch onNavigateNode={handleNavigateNode} />
            <div className="hidden items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-2 backdrop-blur-md lg:flex">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-300/50">{domainMeta[activeDomain].label}</span>
              <span className="text-[11px] text-white/30">{nodeStats.notedCount}/{nodeStats.total} 已点亮</span>
            </div>
          </div>
        </div>

        <div className="relative flex-1" style={{ minHeight: "420px" }}>
          <KnowledgeGraph
            activeDomain={activeDomain}
            highlightNodeId={highlightNodeId}
            litNodeIds={litNodeIds}
            notedNodeIds={stats?.litNodes || []}
          />
        </div>

        <div className="flex gap-3">
          {[
            { label: "总节点", value: nodeStats.total, color: "text-white/80" },
            { label: "已点亮", value: nodeStats.notedCount, color: "text-cyan-300" },
            { label: "笔记数", value: stats?.totalNotes || 0, color: "text-cyan-300" },
          ].map(s => (
            <div key={s.label} className="flex-1 rounded-2xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 text-center backdrop-blur-sm">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="mt-0.5 text-[11px] text-white/30">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <aside
        className="hidden w-[280px] flex-shrink-0 flex-col gap-5 overflow-y-auto border-l border-white/[0.05] p-5 xl:flex"
        style={{ background: "rgba(10,16,30,0.4)", backdropFilter: "blur(16px)" }}
      >
        <Heatmap data={stats?.heatmap || {}} />
        <div className="h-px bg-white/[0.04]" />
        <SyncRadar data={stats?.radar || {}} />
        <div className="h-px bg-white/[0.04]" />
        <RecentSignals notes={stats?.recentNotes || []} />
      </aside>

      <ChatPanel />
    </div>
  );
}
