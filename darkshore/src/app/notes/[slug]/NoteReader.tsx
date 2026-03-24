"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";
import Link from "next/link";

interface NoteReaderProps {
  meta: Record<string, string>;
  slug: string;
  htmlContent: string;
}

export default function NoteReader({ meta, slug, htmlContent }: NoteReaderProps) {
  const [immersive, setImmersive] = useState(false);

  return (
    <div className={`transition-all duration-500 ${immersive ? "fixed inset-0 z-50 overflow-y-auto" : "relative"}`}>
      {/* 沉浸模式背景 */}
      <AnimatePresence>
        {immersive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[#0a0f1d]"
          />
        )}
      </AnimatePresence>

      <div className={`relative z-50 mx-auto px-6 py-10 md:px-8 ${immersive ? "max-w-3xl" : "max-w-4xl"}`}>
        {/* 顶栏 */}
        <AnimatePresence>
          {!immersive && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 flex items-center justify-between"
            >
              <Link
                href="/"
                className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.04] px-3 py-2 text-xs text-white/50 transition hover:border-cyan-400/20 hover:text-cyan-300"
              >
                <ArrowLeft size={14} /> 返回守望台
              </Link>
              <button
                onClick={() => setImmersive(true)}
                className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.04] px-3 py-2 text-xs text-white/50 transition hover:border-cyan-400/20 hover:text-cyan-300"
              >
                <Maximize2 size={14} /> 沉浸模式
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 沉浸模式退出按钮 */}
        {immersive && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setImmersive(false)}
            className="fixed right-6 top-6 z-[60] flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-white/40 backdrop-blur-md transition hover:text-cyan-300"
          >
            <Minimize2 size={14} /> 退出沉浸
          </motion.button>
        )}

        {/* 笔记卡片 */}
        <div
          className={`overflow-hidden rounded-2xl ${
            immersive
              ? "border-0 bg-transparent"
              : "glass border border-white/10"
          }`}
          style={immersive ? {} : { padding: "2rem" }}
        >
          {/* 头部信息 */}
          <div className={`border-b border-white/8 pb-6 ${immersive ? "mb-10" : "mb-8"}`}>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-300/65">
              {immersive ? "Immersive Reading" : "Knowledge Note"}
            </p>
            <h1 className={`mt-3 font-bold text-white/90 ${immersive ? "text-4xl leading-tight" : "text-3xl"}`}>
              {meta.title ?? slug}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/45">
              {meta.domain && (
                <span className="rounded-full border border-cyan-400/20 px-3 py-1">{meta.domain}</span>
              )}
              {meta.createdAt && (
                <span className="rounded-full border border-white/10 px-3 py-1">{meta.createdAt}</span>
              )}
            </div>
          </div>

          {/* 文章内容 */}
          <article
            className={`prose prose-invert max-w-none text-white/80
              [&_a]:text-cyan-300/80 [&_a]:underline [&_a]:decoration-cyan-400/30 [&_a:hover]:text-cyan-200
              [&_blockquote]:border-l-2 [&_blockquote]:border-cyan-400/40 [&_blockquote]:pl-4 [&_blockquote]:text-white/60 [&_blockquote]:italic
              [&_.code-block]:my-4 [&_.code-block]:overflow-x-auto [&_.code-block]:rounded-xl [&_.code-block]:border [&_.code-block]:border-white/8 [&_.code-block]:bg-[#0d1526]/80 [&_.code-block]:p-4 [&_.code-block]:font-mono [&_.code-block]:text-[13px] [&_.code-block]:leading-6 [&_.code-block]:text-cyan-100/80
              [&_.inline-code]:rounded [&_.inline-code]:bg-white/10 [&_.inline-code]:px-1.5 [&_.inline-code]:py-0.5 [&_.inline-code]:font-mono [&_.inline-code]:text-[13px] [&_.inline-code]:text-cyan-200/80
              [&_del]:text-white/30
              [&_em]:text-cyan-100/70
              [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-bold
              [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white/85
              [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-white/80
              [&_hr]:my-8 [&_hr]:border-white/8
              [&_li]:ml-4 [&_li]:list-none
              [&_p]:my-3 [&_p]:leading-7
              [&_strong]:text-white/95
              ${immersive ? "text-[15px] [&_p]:leading-8" : ""}
            `}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </div>
    </div>
  );
}

