"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Compass,
  FileText,
  PenLine,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import BlogFeed from "@/components/BlogFeed";
import ChatPanel from "@/components/ChatPanel";
import { domainMeta, type NodeCategory } from "@/lib/data/initialRoadmaps";

interface QuickStats {
  totalNotes: number;
  totalLogs: number;
  litNodes?: string[];
}

const DOMAIN_ORDER: NodeCategory[] = ["frontend", "backend", "ai", "gamedev", "python"];

export default function HomePage() {
  const [stats, setStats] = useState<QuickStats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {});
  }, []);

  const heroStats = useMemo(
    () => [
      { label: "文章与笔记", value: stats?.totalNotes || 0 },
      { label: "点亮节点", value: stats?.litNodes?.length || 0 },
      { label: "学习记录", value: stats?.totalLogs || 0 },
    ],
    [stats],
  );

  return (
    <div className="shore-container pb-20 pt-6 sm:pt-8 lg:pt-10">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-10 lg:gap-14">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8"
        >
          <div className="shore-panel overflow-hidden px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <p className="shore-eyebrow">Darkshore · Personal Knowledge Log</p>
            <h1 className="shore-hero-title mt-4 max-w-[760px] text-white">
              一个更适合长期写作、阅读与整理知识航线的个人站点。
            </h1>
            <p className="mt-5 max-w-[640px] text-[15px] leading-8 text-white/68 sm:text-[16px]">
              黑海岸保留深海与星图的品牌气质，但把真正重要的内容放回前景：持续更新的文章、结构化的学习笔记，以及能够帮助你理解知识进展的观测站。
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="#latest"
                className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-[14px] font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                开始阅读
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/observatory"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-[14px] font-medium text-white/78 transition hover:border-cyan-300/30 hover:bg-white/[0.08] hover:text-white"
              >
                浏览知识观测站
                <Compass size={15} />
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {heroStats.map((item) => (
                <div key={item.label} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-4">
                  <p className="text-[12px] tracking-[0.08em] text-white/42">{item.label}</p>
                  <p className="mt-2 text-[1.7rem] font-semibold tracking-[-0.04em] text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="grid gap-4">
            <div className="shore-card px-5 py-5">
              <div className="flex items-center gap-2 text-cyan-200/84">
                <Sparkles size={15} />
                <p className="text-[13px] font-medium">站点定位</p>
              </div>
              <p className="mt-3 text-[14px] leading-7 text-white/68">
                把博客、学习笔记与知识地图放在同一个叙事里：先读内容，再理解结构，最后回到自己的学习路径。
              </p>
            </div>
            <div className="shore-card px-5 py-5">
              <div className="flex items-center gap-2 text-cyan-200/84">
                <BookOpen size={15} />
                <p className="text-[13px] font-medium">推荐阅读路径</p>
              </div>
              <ul className="mt-3 space-y-3 text-[13px] leading-6 text-white/66">
                <li>先看最新文章，快速了解近期关注主题</li>
                <li>再进入知识观测站，查看各领域的沉淀情况</li>
                <li>最后从节点进入对应笔记，形成连续阅读体验</li>
              </ul>
            </div>
          </aside>
        </motion.section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6">
          <div className="shore-panel px-6 py-6 sm:px-8 sm:py-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-300/14 text-cyan-200">
                <FileText size={16} />
              </div>
              <div>
                <p className="text-[16px] font-semibold text-white">内容优先的阅读首页</p>
                <p className="mt-1 text-[13px] text-white/48">最新文章、学习笔记与知识专题会在这里持续汇聚。</p>
              </div>
            </div>
          </div>

          <div className="shore-card px-5 py-5">
            <p className="shore-eyebrow">Curated Sections</p>
            <p className="mt-3 text-[15px] font-semibold text-white">从主题进入，而不是只按时间滚动。</p>
            <p className="mt-2 text-[13px] leading-6 text-white/60">
              用领域入口和精选内容，降低第一次访问时的理解成本，让首页更像一个可长期消费的博客产品。
            </p>
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="shore-eyebrow">Domains</p>
              <h2 className="mt-2 text-[1.7rem] font-semibold tracking-[-0.03em] text-white">按主题进入你的知识海域</h2>
            </div>
            <Link href="/observatory" className="hidden text-[13px] text-cyan-200/85 transition hover:text-cyan-100 sm:inline-flex sm:items-center sm:gap-1.5">
              查看完整观测站 <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {DOMAIN_ORDER.map((key) => (
              <Link
                key={key}
                href="/observatory"
                className="shore-card glass-hover px-5 py-5"
              >
                <p className="text-[15px] font-semibold text-white">{domainMeta[key].label}</p>
                <p className="mt-2 text-[13px] leading-6 text-white/60">{domainMeta[key].description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section id="latest" className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-6">
          <div className="min-w-0">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="shore-eyebrow">Latest Writing</p>
                <h2 className="mt-2 text-[1.7rem] font-semibold tracking-[-0.03em] text-white">最新更新</h2>
              </div>
            </div>
            <BlogFeed />
          </div>

          <aside className="grid gap-4 self-start xl:sticky xl:top-6">
            <div className="shore-card px-5 py-5">
              <div className="flex items-center gap-2 text-cyan-200/84">
                <PenLine size={15} />
                <p className="text-[13px] font-medium">写作原则</p>
              </div>
              <p className="mt-3 text-[13px] leading-7 text-white/64">
                这里优先沉淀可复读、可串联、可形成路径感的内容，而不是只记录零散灵感。
              </p>
            </div>
            <div className="shore-card px-5 py-5">
              <div className="flex items-center gap-2 text-cyan-200/84">
                <Compass size={15} />
                <p className="text-[13px] font-medium">下一步</p>
              </div>
              <p className="mt-3 text-[13px] leading-7 text-white/64">
                如果你更偏向结构化浏览，可以直接进入观测站，从节点关系和领域进度的角度理解整个知识版图。
              </p>
            </div>
          </aside>
        </section>
      </div>

      <ChatPanel />
    </div>
  );
}
