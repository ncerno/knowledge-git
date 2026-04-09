"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  FileText,
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

function getHref(note: FeedNote) {
  return note.nodeId && note.node ? `/notes/${note.node.slug || note.nodeId}` : `/post/${note.id}`;
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
      const res = await fetch(`/api/feed?page=${page}&limit=7${typeParam}`);
      const data = await res.json();
      setFeed(data);
    } catch {
      setFeed(null);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const featured = useMemo(() => feed?.notes?.[0] ?? null, [feed]);
  const rest = useMemo(() => feed?.notes?.slice(1) ?? [], [feed]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex rounded-full border border-white/8 bg-white/[0.03] p-1">
          {([
            { key: "all", label: "全部", icon: FileText },
            { key: "blog", label: "博文", icon: PenLine },
            { key: "node", label: "笔记", icon: BookOpen },
          ] as const).map((tab) => {
            const active = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setFilter(tab.key);
                  setPage(1);
                }}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-medium transition ${
                  active ? "bg-cyan-300 text-slate-950" : "text-white/58 hover:text-white/88"
                }`}
              >
                <tab.icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>
        {feed && <p className="text-[12px] text-white/42">共 {feed.total} 条内容</p>}
      </div>

      {loading ? (
        <div className="shore-panel flex items-center justify-center py-24">
          <Loader2 size={20} className="animate-spin text-cyan-300/55" />
        </div>
      ) : !feed || feed.notes.length === 0 ? (
        <div className="shore-panel py-18 text-center">
          <FileText size={28} className="mx-auto text-white/22" />
          <p className="mt-4 text-[14px] text-white/58">还没有任何文章</p>
          <p className="mt-2 text-[12px] text-white/36">从写作页开始创建第一篇内容。</p>
        </div>
      ) : (
        <>
          {featured && (
            <motion.article
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="shore-panel overflow-hidden px-6 py-6 sm:px-8 sm:py-8"
            >
              <Link href={getHref(featured)} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium ${featured.nodeId ? "bg-cyan-300/12 text-cyan-100" : "bg-violet-300/14 text-violet-100"}`}>
                      {featured.nodeId ? <BookOpen size={11} /> : <PenLine size={11} />}
                      {featured.nodeId ? "学习笔记" : "精选博文"}
                    </span>
                    {featured.node && <span className="text-[12px] text-white/44">{featured.node.title}</span>}
                  </div>
                  <h3 className="mt-4 text-[1.8rem] font-semibold leading-[1.2] tracking-[-0.03em] text-white sm:text-[2rem]">
                    {featured.title}
                  </h3>
                  <p className="mt-4 max-w-[700px] text-[14px] leading-8 text-white/64 sm:text-[15px]">
                    {featured.summary || "继续阅读这篇内容，查看最近一次沉淀下来的主题、思路与知识连接。"}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-4 text-[12px] text-white/42">
                    <span className="inline-flex items-center gap-1.5"><Calendar size={12} />{formatDate(featured.createdAt)}</span>
                    <span className="inline-flex items-center gap-1.5"><Tag size={12} />{featured.wordCount} 字</span>
                  </div>
                </div>
                <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-5 py-5 text-[13px] leading-7 text-white/60">
                  <p className="shore-eyebrow">Featured</p>
                  <p className="mt-3">把首页第一篇内容作为主入口，先建立阅读欲望，再进入结构化知识浏览。</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-cyan-200/85">
                    继续阅读 <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </motion.article>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rest.map((note, i) => {
              const tags = parseTags(note.tags);
              const isNodeNote = !!note.nodeId;
              return (
                <motion.article
                  key={note.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  className="shore-card glass-hover overflow-hidden"
                >
                  <Link href={getHref(note)} className="block p-5">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium ${isNodeNote ? "bg-cyan-300/12 text-cyan-100" : "bg-violet-300/14 text-violet-100"}`}>
                        {isNodeNote ? <BookOpen size={10} /> : <PenLine size={10} />}
                        {isNodeNote ? "笔记" : "博文"}
                      </span>
                      {note.node && <span className="truncate text-[11px] text-white/38">{note.node.title}</span>}
                    </div>
                    <h3 className="mt-4 text-[17px] font-semibold leading-7 text-white/92">{note.title}</h3>
                    <p className="mt-3 line-clamp-3 text-[13px] leading-7 text-white/58">
                      {note.summary || "继续阅读这篇内容，查看它与当前知识主题之间的连接。"}
                    </p>
                    {tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[10px] text-white/44">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-5 flex items-center justify-between text-[11px] text-white/38">
                      <span>{formatDate(note.createdAt)}</span>
                      <span>{note.wordCount} 字</span>
                    </div>
                  </Link>
                </motion.article>
              );
            })}
          </div>
        </>
      )}

      {feed && feed.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-[12px] text-white/64 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-30"
          >
            上一页
          </button>
          <span className="text-[12px] text-white/42">
            {page} / {feed.totalPages}
          </span>
          <button
            disabled={page >= feed.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-[12px] text-white/64 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-30"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
