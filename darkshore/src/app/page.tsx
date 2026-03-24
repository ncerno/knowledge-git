"use client";

import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Orbit, Telescope } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import Sidebar from "@/components/Sidebar";
import KnowledgeGraph from "@/components/KnowledgeGraph";
import GlobalSearch from "@/components/GlobalSearch";
import ChatPanel from "@/components/ChatPanel";
import { domainMeta, getDomainProgress, initialRoadmaps, type NodeCategory } from "@/lib/data/initialRoadmaps";

export default function HomePage() {
  const [activeDomain, setActiveDomain] = useState<NodeCategory>("frontend");
  const [highlightNodeId, setHighlightNodeId] = useState<string | null>(null);
  const [litNodeIds, setLitNodeIds] = useState<string[]>([]);

  const stats = useMemo(() => {
    const total = initialRoadmaps.filter((node) => node.depth > 0).length;
    const completed = initialRoadmaps.filter((node) => node.status === "completed").length;
    const available = initialRoadmaps.filter((node) => node.status === "available").length;
    return { total, completed, available };
  }, []);

  const activeProgress = getDomainProgress(activeDomain);

  const handleNavigateNode = useCallback((nodeId: string, category: NodeCategory) => {
    setActiveDomain(category);
    setHighlightNodeId(nodeId);
    setTimeout(() => setHighlightNodeId(null), 3000);
  }, []);

  const handleTaskCompleteLitNode = useCallback((relatedNodeId: string) => {
    setLitNodeIds((prev) => [...prev, relatedNodeId]);
    setTimeout(() => {
      setLitNodeIds((prev) => prev.filter((id) => id !== relatedNodeId));
    }, 4000);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activeDomain={activeDomain} onSelectDomain={setActiveDomain} onTaskComplete={handleTaskCompleteLitNode} />

      <div className="flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto p-6 md:p-8">
        {/* 顶部栏 */}
        <div className="flex items-center justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p className="mb-1 text-[10px] font-mono uppercase tracking-[0.32em] text-cyan-300/70">
              Darkshore · Knowledge Observatory
            </p>
            <h1 className="text-2xl font-bold text-white/90 md:text-3xl">
              黑海岸 · 守望站
            </h1>
          </motion.div>
          <div className="flex items-center gap-3">
            <GlobalSearch onNavigateNode={handleNavigateNode} />
            <GlassCard padding="px-3 py-2" className="hidden lg:block">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-300/60">
                <Telescope size={11} /> {domainMeta[activeDomain].label}
                <span className="ml-1 text-white/40">{activeProgress.completed}/{activeProgress.total}</span>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* 主内容区 */}
        <div className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-3">
          <GlassCard accentBar padding="p-4" className="xl:col-span-2">
            <KnowledgeGraph
              activeDomain={activeDomain}
              highlightNodeId={highlightNodeId}
              litNodeIds={litNodeIds}
            />
          </GlassCard>

          <div className="flex flex-col gap-3">
            <GlassCard padding="p-4">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-300/65">
                <Orbit size={12} /> 星海统计
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                  <p className="text-2xl font-bold text-white/90">{stats.total}</p>
                  <p className="mt-1 text-[11px] text-white/40">总节点</p>
                </div>
                <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.04] p-3">
                  <p className="text-2xl font-bold text-cyan-300">{stats.available}</p>
                  <p className="mt-1 text-[11px] text-white/40">已解锁</p>
                </div>
                <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.04] p-3">
                  <p className="text-2xl font-bold text-emerald-300">{stats.completed}</p>
                  <p className="mt-1 text-[11px] text-white/40">已完成</p>
                </div>
              </div>
            </GlassCard>

            {/* 当前焦点域描述 */}
            <GlassCard accentBar padding="p-4">
              <p className="text-xs font-medium text-white/80">{domainMeta[activeDomain].label}</p>
              <p className="mt-1 text-[11px] text-white/40 leading-5">{domainMeta[activeDomain].description}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${activeProgress.ratio * 100}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* AI 对话面板 */}
      <ChatPanel />
    </div>
  );
}
