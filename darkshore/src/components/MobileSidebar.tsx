"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Anchor, Brain, Code2, Gamepad2, Menu, Orbit, Server, Sparkles, X } from "lucide-react";
import { domainMeta, initialRoadmaps, type NodeCategory } from "@/lib/data/initialRoadmaps";

interface Props {
  activeDomain: NodeCategory;
  onSelectDomain: (domain: NodeCategory) => void;
  litCount?: number;
}

const DOMAINS: { key: NodeCategory; icon: typeof Code2 }[] = [
  { key: "frontend", icon: Code2 },
  { key: "backend", icon: Server },
  { key: "ai", icon: Brain },
  { key: "gamedev", icon: Gamepad2 },
  { key: "python", icon: Sparkles },
];

export default function MobileSidebar({ activeDomain, onSelectDomain, litCount = 0 }: Props) {
  const [open, setOpen] = useState(false);
  const total = useMemo(() => initialRoadmaps.filter((n) => n.depth > 0).length, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex min-h-11 items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-4 py-2.5 text-[13px] text-white/82 backdrop-blur-xl transition hover:bg-white/[0.08] hover:text-white lg:hidden"
      >
        <Menu size={16} className="text-cyan-200/90" />
        导航
      </button>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[120] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-[rgba(3,7,14,0.78)] backdrop-blur-md" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="relative flex h-full w-[88vw] max-w-[380px] flex-col bg-[rgba(8,15,29,0.98)] px-5 py-5 shadow-[0_20px_80px_rgba(0,0,0,0.42)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-300/[0.1]">
                    <Anchor size={18} className="text-cyan-200" />
                  </div>
                  <div className="pr-2">
                    <p className="text-[16px] font-semibold text-white">黑海岸</p>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-cyan-200/70">Navigation</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="rounded-full bg-white/[0.06] p-2.5 text-white/70">
                  <X size={16} />
                </button>
              </div>

              <div className="mt-4 rounded-[18px] border border-white/8 bg-white/[0.04] p-4">
                <p className="text-[12px] font-medium text-white/65">当前观测</p>
                <p className="mt-2 text-[18px] font-semibold text-white">{domainMeta[activeDomain].label}</p>
                <p className="mt-1.5 text-[13px] leading-6 text-white/68">{domainMeta[activeDomain].description}</p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3.5 py-2 text-[12px] text-white/78">
                  <Orbit size={12} className="text-cyan-200/90" />
                  {litCount}/{total} 已点亮
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                {DOMAINS.map(({ key, icon: Icon }) => {
                  const active = key === activeDomain;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        onSelectDomain(key);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-[18px] border px-4 py-3.5 text-left transition ${
                        active
                          ? "border-cyan-300/20 bg-cyan-300/[0.1]"
                          : "border-transparent bg-white/[0.04] hover:bg-white/[0.07]"
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white/[0.07]">
                        <Icon size={16} className={active ? "text-cyan-200" : "text-white/78"} />
                      </div>
                      <div className="min-w-0 pr-1">
                        <p className={`text-[14px] font-semibold ${active ? "text-white" : "text-white/88"}`}>{domainMeta[key].label}</p>
                        <p className="mt-1 text-[12px] leading-5 text-white/64">{domainMeta[key].description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-auto rounded-[18px] border border-white/8 bg-white/[0.04] p-4">
                <p className="text-[12px] font-medium text-white/65">使用方式</p>
                <p className="mt-2 text-[13px] leading-6 text-white/66">先从领域切换和搜索进入节点，再在主画布中观察关系，最后进入对应笔记继续阅读或写作。</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
