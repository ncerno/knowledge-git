"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Orbit, Sparkles, Telescope } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import Sidebar from "@/components/Sidebar";
import KnowledgeGraph from "@/components/KnowledgeGraph";
import { domainMeta, getDomainProgress, initialRoadmaps, type NodeCategory } from "@/lib/data/initialRoadmaps";

const DOMAIN_ORDER: NodeCategory[] = ["frontend", "backend", "ai", "gamedev", "python"];

export default function HomePage() {
  const [activeDomain, setActiveDomain] = useState<NodeCategory>("frontend");

  const stats = useMemo(() => {
    const total = initialRoadmaps.filter((node) => node.depth > 0).length;
    const completed = initialRoadmaps.filter((node) => node.status === "completed").length;
    const available = initialRoadmaps.filter((node) => node.status === "available").length;
    return { total, completed, available };
  }, []);

  const activeProgress = getDomainProgress(activeDomain);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activeDomain={activeDomain} onSelectDomain={setActiveDomain} />

      <div className="flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto p-6 md:p-8">
        <motion.div
          className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <p className="mb-2 text-[10px] font-mono uppercase tracking-[0.32em] text-cyan-300/70">Darkshore · Knowledge Observatory</p>
            <h1 className="text-3xl font-bold text-white/90 md:text-4xl">
              黑海岸 · 个人学习守望站
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
              五大领域化作五片星域。你的学习路径，不再只是清单，而是一张可被凝视、缩放、探索与穿行的知识星座图。
            </p>
          </div>

          <GlassCard accentBar padding="px-4 py-3" className="min-w-[280px]">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.24em] text-cyan-300/65">
              <Telescope size={12} /> 当前焦点
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-white/90">{domainMeta[activeDomain].label}</p>
                <p className="mt-1 text-xs text-white/45">{domainMeta[activeDomain].description}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-cyan-300">{activeProgress.completed}/{activeProgress.total}</p>
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/35">progress</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <GlassCard accentBar padding="p-5" className="xl:col-span-2">
            <KnowledgeGraph activeDomain={activeDomain} />
          </GlassCard>

          <div className="flex flex-col gap-4">
            <GlassCard padding="p-5">
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

            <GlassCard padding="p-5">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-300/65">
                <Sparkles size={12} /> 星域总览
              </div>
              <div className="mt-4 space-y-3">
                {DOMAIN_ORDER.map((domain) => {
                  const progress = getDomainProgress(domain);
                  const active = activeDomain === domain;
                  return (
                    <button
                      key={domain}
                      onClick={() => setActiveDomain(domain)}
                      className="w-full rounded-2xl border px-4 py-3 text-left transition"
                      style={{
                        background: active ? "rgba(0,229,255,0.08)" : "rgba(255,255,255,0.02)",
                        borderColor: active ? "rgba(34,211,238,0.28)" : "rgba(255,255,255,0.08)",
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-white/85">{domainMeta[domain].label}</span>
                        <span className="text-[11px] text-white/45">{progress.completed}/{progress.total}</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8">
                        <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-400" style={{ width: `${progress.ratio * 100}%` }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
