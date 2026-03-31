"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PenLine, Map, FileText } from "lucide-react";
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

  const totalWords = stats?.totalLogs || 0;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[860px] flex-col px-5 lg:px-8">

      {/* ===== Hero Section — 极简居中 ===== */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center pt-20 pb-16 sm:pt-28 sm:pb-20 lg:pt-36 lg:pb-24"
      >
        {/* 蝴蝶 */}
        <ShoreButterfly className="mb-8 scale-125 sm:scale-150" />

        {/* 标题 */}
        <h1 className="text-center text-[2rem] font-bold leading-[1.15] tracking-[-0.03em] text-white sm:text-[2.6rem] lg:text-[3.2rem]">
          深岸守望站
        </h1>
        <p className="mt-2 font-mono text-[11px] tracking-[0.18em] text-cyan-200/40 sm:text-[12px]">
          DARKSHORE · SHOREKEEPER
        </p>

        {/* Slogan */}
        <p className="mt-5 max-w-[420px] text-center text-[14px] leading-7 text-white/50 sm:text-[15px]">
          在深海与星潮之间，梳理你的学习航线
        </p>

        {/* CTA 按钮 */}
        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/write"
            className="flex items-center gap-2.5 rounded-[10px] border border-cyan-400/20 bg-cyan-400/[0.08] px-6 py-3 text-[14px] font-medium text-cyan-100 transition duration-300 hover:border-cyan-400/35 hover:bg-cyan-400/[0.14] hover:shadow-[0_0_24px_rgba(34,211,238,0.12)]"
          >
            <PenLine size={15} />
            开始写作
          </Link>
          <Link
            href="/observatory"
            className="flex items-center gap-2.5 rounded-[10px] border border-white/[0.1] bg-white/[0.04] px-6 py-3 text-[14px] font-medium text-white/65 transition duration-300 hover:border-white/[0.18] hover:bg-white/[0.07] hover:text-white/90"
          >
            <Map size={15} />
            知识星图
          </Link>
        </div>

        {/* 轻量统计 */}
        <div className="mt-10 flex items-center gap-5 text-[12px] text-white/30">
          <span>{stats?.totalNotes || 0} 篇文章</span>
          <span className="h-3 w-px bg-white/[0.1]" />
          <span>{stats?.litNodes?.length || 0} 个节点已点亮</span>
          <span className="h-3 w-px bg-white/[0.1]" />
          <span>{totalWords} 条学习记录</span>
        </div>
      </motion.section>

      {/* ===== 文章信息流 ===== */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="pb-16"
      >
        <div className="mb-6 flex items-center gap-2.5">
          <FileText size={15} className="text-white/40" />
          <h2 className="text-[15px] font-semibold text-white/75">最新动态</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-white/[0.06] to-transparent" />
        </div>
        <BlogFeed />
      </motion.section>

      <ChatPanel />
    </div>
  );
}
