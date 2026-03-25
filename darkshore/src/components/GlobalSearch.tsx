"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, MapPin, FileText, Sparkles } from "lucide-react";
import Fuse from "fuse.js";
import { initialRoadmaps, domainMeta, type RawKnowledgeNode, type NodeCategory } from "@/lib/data/initialRoadmaps";

interface GlobalSearchProps {
  onNavigateNode?: (nodeId: string, category: NodeCategory) => void;
}

const QUICK_DOMAINS: NodeCategory[] = ["frontend", "backend", "ai", "gamedev", "python"];

export default function GlobalSearch({ onNavigateNode }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(initialRoadmaps, {
        keys: [
          { name: "title", weight: 0.4 },
          { name: "description", weight: 0.3 },
          { name: "tags", weight: 0.2 },
          { name: "category", weight: 0.1 },
        ],
        threshold: 0.35,
        includeScore: true,
      }),
    [],
  );

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query).slice(0, 8);
  }, [query, fuse]);

  const handleOpen = useCallback(() => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  const handleSelect = useCallback(
    (node: RawKnowledgeNode) => {
      onNavigateNode?.(node.id, node.category);
      handleClose();
    },
    [onNavigateNode, handleClose],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        open ? handleClose() : handleOpen();
      }
      if (e.key === "Escape" && open) handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, handleClose, handleOpen]);

  const statusColor: Record<string, string> = {
    completed: "text-emerald-300 border-emerald-400/24 bg-emerald-400/[0.06]",
    available: "text-cyan-300 border-cyan-400/24 bg-cyan-400/[0.06]",
    locked: "text-white/36 border-white/10 bg-white/[0.03]",
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex min-h-11 items-center gap-2.5 rounded-[16px] bg-[rgba(255,255,255,0.06)] px-4 py-2.5 text-[13px] text-white/82 backdrop-blur-md transition duration-200 hover:bg-white/[0.09] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/25"
      >
        <Search size={14} className="text-cyan-200/90" />
        <span className="hidden pr-1 sm:inline">搜索星图、节点与航线</span>
        <kbd className="ml-1 hidden rounded-[10px] bg-white/[0.07] px-2.5 py-1.5 font-mono text-[10px] text-white/72 sm:inline">
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-start justify-center px-5 pt-[10vh] sm:px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-[rgba(4,8,16,0.78)] backdrop-blur-md" onClick={handleClose} />

            <motion.div
              className="relative z-10 w-full max-w-[860px] overflow-hidden rounded-[22px] bg-[rgba(15,22,38,0.96)] shadow-[0_24px_120px_rgba(0,0,0,0.42)] backdrop-blur-2xl"
              initial={{ scale: 0.96, y: -18 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: -18 }}
            >
              <div className="border-b border-white/[0.08] px-5 py-5 sm:px-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="pr-2">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-cyan-200/70">Darkshore Search</p>
                    <p className="mt-1.5 text-[14px] leading-6 text-white/72">在五大星域中检索节点、主题与笔记入口</p>
                  </div>
                  <button onClick={handleClose} className="rounded-[14px] bg-white/[0.06] p-2.5 text-white/68 transition hover:bg-white/[0.1] hover:text-white">
                    <X size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-3 rounded-[16px] bg-white/[0.06] px-4 py-3.5 transition focus-within:bg-white/[0.09]">
                  <Sparkles size={16} className="text-cyan-200/90" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="搜索知识节点、学习主题或领域关键词..."
                    className="flex-1 bg-transparent pr-1 text-[14px] text-white placeholder-white/52 outline-none"
                  />
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-5">
                {query.trim() && results.length === 0 && (
                  <div className="rounded-[16px] bg-white/[0.05] px-4 py-10 text-center">
                    <p className="text-[14px] text-white/68">未探测到匹配信号，试试更短的关键词或领域名。</p>
                  </div>
                )}

                {results.map(({ item, score }) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="group flex w-full items-start gap-3 rounded-[16px] px-4 py-3.5 text-left transition duration-200 hover:bg-white/[0.06]"
                  >
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-white/[0.06]">
                      <MapPin size={14} className={statusColor[item.status]?.split(" ")[0]} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-[15px] font-medium text-white transition group-hover:text-cyan-100">{item.title}</span>
                        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] ${statusColor[item.status]}`}>{domainMeta[item.category].label}</span>
                      </div>
                      {item.description && <p className="mt-1.5 line-clamp-2 text-[12px] leading-6 text-white/68">{item.description}</p>}
                    </div>
                    <span className="mt-1 shrink-0 text-[11px] text-white/54">{((1 - (score ?? 1)) * 100).toFixed(0)}%</span>
                  </button>
                ))}

                {!query.trim() && (
                  <div className="space-y-4">
                    <div className="rounded-[18px] bg-white/[0.045] p-4">
                      <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white/64">
                        <FileText size={12} /> 快捷航路
                      </p>
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {QUICK_DOMAINS.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setQuery(domainMeta[cat].label)}
                            className="rounded-[16px] bg-white/[0.055] px-3.5 py-3.5 text-left transition duration-200 hover:bg-white/[0.08]"
                          >
                            <p className="text-[13px] font-semibold text-white/88">{domainMeta[cat].label}</p>
                            <p className="mt-1 text-[12px] leading-5 text-white/66">{domainMeta[cat].description}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="px-1 text-[12px] text-white/60">提示：按 <span className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-white/78">Esc</span> 可快速关闭。</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

