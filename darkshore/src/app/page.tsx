"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Map, PenLine, BookOpen, FileText, Sparkles, Upload } from "lucide-react";
import Link from "next/link";
import BlogFeed from "@/components/BlogFeed";
import ShoreButterfly from "@/components/ShoreButterfly";
import ChatPanel from "@/components/ChatPanel";

interface QuickStats {
  totalNotes: number;
  totalLogs: number;
  litNodes?: string[];
}

export default function HomePage() {
  const [stats, setStats] = useState<QuickStats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col gap-6 px-5 py-6 lg:px-8 lg:py-8">
      {/* ===== 顶部 Header ===== */}
      <motion.header
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="shore-panel px-6 py-6 sm:px-8 sm:py-7"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[2rem] font-semibold leading-[1.16] tracking-[-0.025em] text-white sm:text-[2.2rem] lg:text-[2.6rem]">
                  黑海岸 · 守望站
                </h1>
                <ShoreButterfly className="ml-1 hidden sm:block" />
              </div>
              <p className="mt-1 font-mono text-[11px] tracking-[0.12em] text-cyan-200/50">
                Darkshore · Knowledge Observatory
              </p>
            </div>
          </div>

          {/* 快捷统计 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 rounded-[10px] bg-white/[0.03] px-4 py-3">
              <div className="text-center">
                <p className="text-[18px] font-semibold text-white">{stats?.totalNotes || 0}</p>
                <p className="text-[10px] text-white/45">文章</p>
              </div>
              <div className="h-6 w-px bg-white/[0.08]" />
              <div className="text-center">
                <p className="text-[18px] font-semibold text-cyan-300">{stats?.litNodes?.length || 0}</p>
                <p className="text-[10px] text-white/45">已点亮</p>
              </div>
              <div className="h-6 w-px bg-white/[0.08]" />
              <div className="text-center">
                <p className="text-[18px] font-semibold text-white">{stats?.totalLogs || 0}</p>
                <p className="text-[10px] text-white/45">学习记录</p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 max-w-[660px] text-[14px] leading-7 text-white/60 lg:text-[15px]">
          守岸人的数字领地。在这里记录学习心得、技术博文和观测笔记。
        </p>

        {/* 快捷入口 */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            href="/write"
            className="flex items-center gap-2 rounded-[8px] border border-cyan-400/16 bg-cyan-400/[0.07] px-4 py-2.5 text-[13px] font-medium text-cyan-200 transition hover:bg-cyan-400/[0.12]"
          >
            <PenLine size={14} />
            写文章
          </Link>
          <Link
            href="/observatory"
            className="flex items-center gap-2 rounded-[8px] border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[13px] font-medium text-white/68 transition hover:border-cyan-400/12 hover:bg-white/[0.06] hover:text-white"
          >
            <Map size={14} />
            知识星图
          </Link>
        </div>
      </motion.header>

      {/* ===== 功能卡片区 ===== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/write" className="shore-card group px-5 py-4 transition hover:border-cyan-400/14 hover:bg-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-violet-400/[0.08]">
              <PenLine size={16} className="text-violet-300/80" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-white/88">自由写作</p>
              <p className="mt-0.5 text-[11px] text-white/45">写一篇博文、心得或随笔</p>
            </div>
          </div>
        </Link>
        <Link href="/observatory" className="shore-card group px-5 py-4 transition hover:border-cyan-400/14 hover:bg-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-cyan-400/[0.08]">
              <BookOpen size={16} className="text-cyan-300/80" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-white/88">知识星图</p>
              <p className="mt-0.5 text-[11px] text-white/45">进入结构化学习路线</p>
            </div>
          </div>
        </Link>
        <Link href="/import" className="shore-card group px-5 py-4 transition hover:border-cyan-400/14 hover:bg-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-emerald-400/[0.08]">
              <Upload size={16} className="text-emerald-300/80" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-white/88">导入路线图</p>
              <p className="mt-0.5 text-[11px] text-white/45">从 roadmap.sh 导入知识图谱</p>
            </div>
          </div>
        </Link>
        <Link href="/observatory" className="shore-card group px-5 py-4 transition hover:border-cyan-400/14 hover:bg-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-amber-400/[0.08]">
              <Sparkles size={16} className="text-amber-300/80" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-white/88">AI 总结</p>
              <p className="mt-0.5 text-[11px] text-white/45">查看学习总结和进度分析</p>
            </div>
          </div>
        </Link>
      </div>

      {/* ===== 文章信息流 ===== */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="mb-4 flex items-center gap-2">
          <FileText size={16} className="text-white/50" />
          <h2 className="text-[16px] font-semibold text-white/85">最新动态</h2>
          <span className="font-mono text-[10px] tracking-[0.1em] text-white/30">RECENT POSTS</span>
        </div>
        <BlogFeed />
      </motion.section>

      <ChatPanel />
    </div>
  );
}
