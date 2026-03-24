"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, MapPin, FileText, Sparkles } from "lucide-react";
import Fuse from "fuse.js";
import { initialRoadmaps, domainMeta, type RawKnowledgeNode, type NodeCategory } from "@/lib/data/initialRoadmaps";

interface GlobalSearchProps {
  onNavigateNode?: (nodeId: string, category: NodeCategory) => void;
}

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

  // Ctrl+K / Cmd+K 快捷键
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
    completed: "text-emerald-300 border-emerald-400/30",
    available: "text-cyan-300 border-cyan-400/30",
    locked: "text-white/30 border-white/10",
  };

  return (
    <>
      {/* 触发按钮 */}
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/50 backdrop-blur-md transition hover:border-cyan-400/30 hover:text-white/70"
      >
        <Search size={14} className="text-cyan-300/60" />
        <span className="hidden sm:inline">搜索星图...</span>
        <kbd className="ml-2 hidden rounded border border-white/10 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] sm:inline">
          ⌘K
        </kbd>
      </button>

      {/* 搜索面板 */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* 遮罩 */}
            <div className="absolute inset-0 bg-[#0a0f1d]/80 backdrop-blur-sm" onClick={handleClose} />

            {/* 搜索卡片 */}
            <motion.div
              className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-cyan-400/15 bg-[#0d1526]/95 shadow-[0_0_60px_rgba(0,229,255,0.08)] backdrop-blur-xl"
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
            >
              {/* 搜索输入 */}
              <div className="flex items-center gap-3 border-b border-white/8 px-5 py-4">
                <Sparkles size={16} className="animate-pulse text-cyan-300/70" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="在五大星域中搜索知识节点..."
                  className="flex-1 bg-transparent text-sm text-white/90 placeholder-white/30 outline-none"
                />
                <button onClick={handleClose} className="text-white/30 transition hover:text-white/60">
                  <X size={16} />
                </button>
              </div>

              {/* 结果列表 */}
              <div className="max-h-[50vh] overflow-y-auto p-2">
                {query.trim() && results.length === 0 && (
                  <p className="px-4 py-8 text-center text-sm text-white/30">
                    未探测到匹配信号...尝试其他关键词
                  </p>
                )}
                {results.map(({ item, score }) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="group flex w-full items-start gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-white/[0.04]"
                  >
                    <MapPin size={14} className={`mt-0.5 shrink-0 ${statusColor[item.status]?.split(" ")[0]}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-white/85 group-hover:text-cyan-200">
                          {item.title}
                        </span>
                        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] ${statusColor[item.status]}`}>
                          {domainMeta[item.category].label}
                        </span>
                      </div>
                      {item.description && (
                        <p className="mt-1 truncate text-xs text-white/40">{item.description}</p>
                      )}
                    </div>
                    <span className="mt-0.5 shrink-0 text-[10px] text-white/20">
                      {((1 - (score ?? 1)) * 100).toFixed(0)}%
                    </span>
                  </button>
                ))}

                {!query.trim() && (
                  <div className="space-y-1 px-4 py-3">
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/25">
                      <FileText size={10} className="mr-1 inline" /> 快捷导航
                    </p>
                    {(["frontend", "backend", "ai", "gamedev", "python"] as NodeCategory[]).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setQuery(domainMeta[cat].label)}
                        className="block w-full rounded-lg px-3 py-2 text-left text-xs text-white/50 transition hover:bg-white/[0.04] hover:text-white/80"
                      >
                        {domainMeta[cat].label} · {domainMeta[cat].description}
                      </button>
                    ))}
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

