"use client";

import { motion } from "framer-motion";
import { Anchor, Brain, Code2, Gamepad2, Layers3, Server, Sparkles } from "lucide-react";
import { domainMeta, getDomainProgress, type NodeCategory } from "@/lib/data/initialRoadmaps";

interface SidebarProps {
  activeDomain: NodeCategory;
  onSelectDomain: (domain: NodeCategory) => void;
}

const DOMAIN_ICONS = {
  frontend: Code2,
  backend: Server,
  ai: Brain,
  gamedev: Gamepad2,
  python: Sparkles,
} satisfies Record<NodeCategory, typeof Code2>;

const ORDER: NodeCategory[] = ["frontend", "backend", "ai", "gamedev", "python"];

export default function Sidebar({ activeDomain, onSelectDomain }: SidebarProps) {
  return (
    <motion.aside
      className="relative flex h-full w-[280px] flex-shrink-0 flex-col overflow-hidden border-r border-white/10 bg-[rgba(10,16,30,0.72)] backdrop-blur-xl"
      initial={{ x: -18, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

      <div className="px-5 pb-4 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 shadow-[0_0_18px_rgba(0,229,255,0.18)]">
            <Anchor size={18} className="text-cyan-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white/90">黑海岸</p>
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-300/65">Dark Shore</p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/35">导航信标</p>
          <h2 className="mt-2 text-lg font-semibold text-white/90">知识星域</h2>
          <p className="mt-1 text-xs leading-5 text-white/45">每个领域都是黑海岸上的一片星群，点击即可聚焦对应知识星座。</p>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-5">
        {ORDER.map((domain) => {
          const Icon = DOMAIN_ICONS[domain];
          const meta = domainMeta[domain];
          const progress = getDomainProgress(domain);
          const active = domain === activeDomain;
          return (
            <motion.button
              key={domain}
              onClick={() => onSelectDomain(domain)}
              className="relative w-full overflow-hidden rounded-2xl border px-4 py-4 text-left"
              style={{
                background: active ? "rgba(0,229,255,0.1)" : "rgba(255,255,255,0.02)",
                borderColor: active ? "rgba(34,211,238,0.35)" : "rgba(255,255,255,0.08)",
              }}
              whileHover={{ scale: 1.01, borderColor: "rgba(34,211,238,0.28)", backgroundColor: "rgba(0,229,255,0.05)" }}
            >
              {active && <div className="absolute inset-y-3 left-0 w-[3px] rounded-r-full bg-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.6)]" />}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/18 bg-cyan-400/8">
                  <Icon size={16} className={active ? "text-cyan-300" : "text-white/55"} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white/90">{meta.label}</p>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-mono text-white/45">
                      {progress.completed}/{progress.total}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-5 text-white/40">{meta.description}</p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.ratio * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="border-t border-white/8 px-5 py-4">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">
          <Layers3 size={12} />
          <span>Constellation Sync Ready</span>
        </div>
      </div>
    </motion.aside>
  );
}

