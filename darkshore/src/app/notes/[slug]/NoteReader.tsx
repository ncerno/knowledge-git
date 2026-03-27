"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Maximize2, Minimize2, Compass, CalendarDays } from "lucide-react";
import Link from "next/link";

interface NoteReaderProps {
  meta: Record<string, string>;
  slug: string;
  htmlContent: string;
}

export default function NoteReader({ meta, slug, htmlContent }: NoteReaderProps) {
  const [immersive, setImmersive] = useState(false);

  return (
    <div className={`transition-all duration-500 ${immersive ? "fixed inset-0 z-50 overflow-y-auto bg-[#08111d]" : "relative"}`}>
      <AnimatePresence>
        {immersive && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_28%),#08111d]" />}
      </AnimatePresence>

      <div className={`relative z-50 mx-auto px-5 py-7 sm:px-6 lg:px-8 ${immersive ? "max-w-[960px]" : "max-w-[1120px]"}`}>
        <AnimatePresence>
          {!immersive && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link href="/" className="inline-flex items-center gap-2 rounded-[8px] border border-white/[0.07] bg-white/[0.03] px-3.5 py-2 text-xs text-white/50 transition hover:border-cyan-400/14 hover:text-white/80">
                <ArrowLeft size={14} /> 返回首页
              </Link>
              <button onClick={() => setImmersive(true)} className="inline-flex items-center gap-2 rounded-[8px] border border-white/[0.07] bg-white/[0.03] px-3.5 py-2 text-xs text-white/50 transition hover:border-cyan-400/14 hover:text-white/80">
                <Maximize2 size={14} /> 沉浸模式
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {immersive && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setImmersive(false)} className="fixed right-4 top-4 z-[60] inline-flex items-center gap-2 rounded-[8px] border border-white/[0.07] bg-[rgba(8,14,26,0.8)] px-3.5 py-2 text-xs text-white/50 backdrop-blur-md transition hover:text-white/80 sm:right-6 sm:top-6">
            <Minimize2 size={14} /> 退出沉浸
          </motion.button>
        )}

        <div className={immersive ? "overflow-hidden px-2 sm:px-4" : "overflow-hidden rounded-[14px] border border-white/[0.06] bg-[rgba(13,20,35,0.7)] p-5 sm:p-6 lg:p-8"}>
          <div className={`border-b border-white/[0.06] ${immersive ? "mb-8 pb-7" : "mb-6 pb-5"}`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-[720px] pr-2">
                <p className="text-[13px] font-medium text-white/65">{immersive ? "沉浸阅读" : "笔记详情"}</p>
                <p className="mt-0.5 font-mono text-[10px] tracking-[0.08em] text-white/30">{immersive ? "Immersive Reading" : "Knowledge Note"}</p>
                <h1 className={`mt-3 font-semibold tracking-[-0.015em] text-white/90 ${immersive ? "text-[2rem] leading-[1.15] sm:text-[2.5rem]" : "text-[1.5rem] leading-[1.2] sm:text-[1.75rem]"}`}>{meta.title ?? slug}</h1>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-white/42">
                {meta.domain && <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-white/[0.04] px-2.5 py-1.5 text-[11px]"><Compass size={11} className="text-cyan-300/60" />{meta.domain}</span>}
                {meta.createdAt && <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-white/[0.04] px-2.5 py-1.5 text-[11px]"><CalendarDays size={11} className="text-white/45" />{meta.createdAt}</span>}
              </div>
            </div>
          </div>

          <article
            className={`max-w-none text-white/78
              [&_a]:text-cyan-300/75 [&_a]:underline [&_a]:decoration-cyan-400/25 [&_a:hover]:text-cyan-200
              [&_blockquote]:my-4 [&_blockquote]:rounded-r-[6px] [&_blockquote]:border-l-2 [&_blockquote]:border-cyan-400/30 [&_blockquote]:bg-white/[0.02] [&_blockquote]:px-4 [&_blockquote]:py-2.5 [&_blockquote]:text-white/55 [&_blockquote]:italic
              [&_.code-block]:my-4 [&_.code-block]:overflow-x-auto [&_.code-block]:rounded-[8px] [&_.code-block]:border [&_.code-block]:border-white/[0.07] [&_.code-block]:bg-[#0d1526]/80 [&_.code-block]:p-4 [&_.code-block]:font-mono [&_.code-block]:text-[13px] [&_.code-block]:leading-7 [&_.code-block]:text-cyan-100/78
              [&_.inline-code]:rounded-[4px] [&_.inline-code]:bg-white/8 [&_.inline-code]:px-1.5 [&_.inline-code]:py-0.5 [&_.inline-code]:font-mono [&_.inline-code]:text-[13px] [&_.inline-code]:text-cyan-200/78
              [&_del]:text-white/28 [&_em]:text-cyan-100/65 [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-2.5 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white/82 [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-white/75 [&_hr]:my-6 [&_hr]:border-white/[0.07] [&_li]:ml-4 [&_li]:list-none [&_p]:my-3 [&_p]:leading-7 [&_strong]:text-white/92 ${immersive ? "text-[15px] sm:text-base" : "text-[14px]"}`}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </div>
    </div>
  );
}

