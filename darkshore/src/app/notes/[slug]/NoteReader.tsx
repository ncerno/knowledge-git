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
              <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-[18px] border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-xs text-white/54 transition hover:border-cyan-400/18 hover:text-white/84">
                <ArrowLeft size={14} /> 返回守望台
              </Link>
              <button onClick={() => setImmersive(true)} className="inline-flex min-h-11 items-center gap-2 rounded-[18px] border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-xs text-white/54 transition hover:border-cyan-400/18 hover:text-white/84">
                <Maximize2 size={14} /> 沉浸模式
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {immersive && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setImmersive(false)} className="fixed right-4 top-4 z-[60] inline-flex min-h-11 items-center gap-2 rounded-[18px] border border-white/[0.08] bg-[rgba(8,14,26,0.76)] px-4 py-2.5 text-xs text-white/54 backdrop-blur-md transition hover:text-white/84 sm:right-6 sm:top-6">
            <Minimize2 size={14} /> 退出沉浸
          </motion.button>
        )}

        <div className={immersive ? "overflow-hidden px-2 sm:px-4" : "shore-panel overflow-hidden p-6 sm:p-7 lg:p-9"}>
          <div className={`border-b border-white/[0.08] ${immersive ? "mb-10 pb-9" : "mb-8 pb-7"}`}>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-[720px] pr-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300/58">{immersive ? "Immersive Reading" : "Knowledge Note"}</p>
                <h1 className={`mt-4 font-semibold tracking-[-0.02em] text-white/92 ${immersive ? "text-[2.5rem] leading-[1.12] sm:text-[3.35rem]" : "text-[2rem] leading-[1.15] sm:text-[2.6rem]"}`}>{meta.title ?? slug}</h1>
                <p className="mt-4 max-w-[620px] text-[14px] leading-7 text-white/44">沿着节点沉淀下来的阅读记录与思考片段，在黑海岸中形成可复用的知识航线。</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-white/45">
                {meta.domain && <span className="shore-badge"><Compass size={12} className="text-cyan-300/72" />{meta.domain}</span>}
                {meta.createdAt && <span className="shore-badge"><CalendarDays size={12} className="text-white/52" />{meta.createdAt}</span>}
              </div>
            </div>
          </div>

          <article
            className={`max-w-none text-white/80
              [&_a]:text-cyan-300/80 [&_a]:underline [&_a]:decoration-cyan-400/30 [&_a:hover]:text-cyan-200
              [&_blockquote]:my-5 [&_blockquote]:rounded-r-2xl [&_blockquote]:border-l-2 [&_blockquote]:border-cyan-400/40 [&_blockquote]:bg-white/[0.025] [&_blockquote]:px-5 [&_blockquote]:py-3 [&_blockquote]:text-white/60 [&_blockquote]:italic
              [&_.code-block]:my-5 [&_.code-block]:overflow-x-auto [&_.code-block]:rounded-2xl [&_.code-block]:border [&_.code-block]:border-white/[0.08] [&_.code-block]:bg-[#0d1526]/82 [&_.code-block]:p-4 [&_.code-block]:font-mono [&_.code-block]:text-[13px] [&_.code-block]:leading-7 [&_.code-block]:text-cyan-100/80
              [&_.inline-code]:rounded-lg [&_.inline-code]:bg-white/10 [&_.inline-code]:px-2 [&_.inline-code]:py-1 [&_.inline-code]:font-mono [&_.inline-code]:text-[13px] [&_.inline-code]:text-cyan-200/80
              [&_del]:text-white/30 [&_em]:text-cyan-100/70 [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-white/86 [&_h3]:mb-2 [&_h3]:mt-7 [&_h3]:text-xl [&_h3]:font-medium [&_h3]:text-white/80 [&_hr]:my-8 [&_hr]:border-white/[0.08] [&_li]:ml-4 [&_li]:list-none [&_p]:my-4 [&_p]:leading-8 [&_strong]:text-white/95 ${immersive ? "text-[15px] sm:text-base" : "text-[15px]"}`}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </div>
    </div>
  );
}

