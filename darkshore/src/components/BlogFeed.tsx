"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  ChevronRight,
  FileText,
  Hash,
  Loader2,
  PenLine,
  Tag,
} from "lucide-react";

interface FeedNote {
  id: string;
  title: string;
  summary: string | null;
  tags: string;
  wordCount: number;
  nodeId: string | null;
  node: { id: string; title: string; category: string; slug?: string | null } | null;
  createdAt: string;
  updatedAt: string;
}

interface FeedData {
  notes: FeedNote[];
  total: number;
  page: number;
  totalPages: number;
}

type FilterType = "all" | "blog" | "node";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("zh-CN", { year: "numeric", month: "short", day: "numeric" });
}

function parseTags(tagsStr: string): string[] {
  try {
    const parsed = JSON.parse(tagsStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function BlogFeed() {
  const [feed, setFeed] = useState<FeedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [page, setPage] = useState(1);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const typeParam = filter === "all" ? "" : `&type=${filter}`;
      const res = await fetch(`/api/feed?page=${page}&limit=12${typeParam}`);
      const data = await res.json();
      setFeed(data);
    } catch {
      setFeed(null);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  return (
    <div className="space-y-5">
      {/* 筛选栏 */}
      <div className="flex items-center justify-between gap-4">
        <div className="inline-flex rounded-[8px] bg-white/[0.04] p-0.5">
          {([
            { key: "all", label: "全部", icon: FileText },
            { key: "blog", label: "博文", icon: PenLine },
            { key: "node", label: "学习笔记", icon: BookOpen },
          ] as const).map((tab) => {
            const active = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => { setFilter(tab.key); setPage(1); }}
                className={`flex items-center gap-1.5 rounded-[6px] px-3 py-1.5 text-[12px] font-medium transition ${
                  active ? "bg-cyan-400/[0.12] text-cyan-100" : "text-white/58 hover:text-white/85"
                }`}
              >
                <tab.icon size={12} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 文章列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={20} className="animate-spin text-cyan-300/50" />
        </div>
      ) : !feed || feed.notes.length === 0 ? (
        <div className="shore-panel py-16 text-center">
          <FileText size={28} className="mx-auto text-white/25" />
          <p className="mt-4 text-[14px] text-white/55">还没有任何文章</p>
          <p className="mt-1 text-[12px] text-white/35">点击右上角"写文章"开始你的第一篇</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {feed.notes.map((note, i) => {
            const tags = parseTags(note.tags);
            const isNodeNote = !!note.nodeId;
            return (
              <motion.article
                key={note.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="shore-card group cursor-pointer overflow-hidden transition duration-300 hover:border-cyan-400/14 hover:bg-white/[0.05]"
              >
                <Link href={isNodeNote && note.node ? `/notes/${note.node.slug || note.nodeId}` : `/post/${note.id}`} className="block p-5">
                  {/* 类型标签 */}
                  <div className="mb-3 flex items-center gap-2">
                    {isNodeNote ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-cyan-400/[0.08] px-2 py-0.5 text-[10px] font-medium text-cyan-200/80">
                        <BookOpen size={10} />
                        {note.node?.category || "学习笔记"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-400/[0.1] px-2 py-0.5 text-[10px] font-medium text-violet-200/80">
                        <PenLine size={10} />
                        博文
                      </span>
                    )}
                    {isNodeNote && note.node && (
                      <span className="text-[11px] text-white/40">{note.node.title}</span>
                    )}
                  </div>

                  {/* 标题 */}
                  <h3 className="text-[16px] font-semibold leading-7 text-white/90 transition group-hover:text-cyan-100">
                    {note.title}
                  </h3>

                  {/* 摘要 */}
                  {note.summary && (
                    <p className="mt-2 line-clamp-2 text-[13px] leading-6 text-white/55">
                      {note.summary}
                    </p>
                  )}

                  {/* 标签 */}
                  {tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-0.5 rounded-[4px] bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-white/45">
                          <Hash size={8} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 底部信息 */}
                  <div className="mt-4 flex items-center justify-between text-[11px] text-white/40">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {formatDate(note.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag size={10} />
                        {note.wordCount} 字
                      </span>
                    </div>
                    <ChevronRight size={12} className="text-white/25 transition group-hover:text-cyan-300/50" />
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </div>
      )}

      {/* 分页 */}
      {feed && feed.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-[6px] bg-white/[0.04] px-3 py-1.5 text-[12px] text-white/60 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-30"
          >
            上一页
          </button>
          <span className="text-[12px] text-white/45">
            {page} / {feed.totalPages}
          </span>
          <button
            disabled={page >= feed.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-[6px] bg-white/[0.04] px-3 py-1.5 text-[12px] text-white/60 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-30"
          >
            下一页
          </button>
        </div>
      )}


    </div>
  );
}
