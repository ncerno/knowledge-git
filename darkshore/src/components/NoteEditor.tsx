"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Clock, FileText, Send, Compass, NotebookText } from "lucide-react";
import Link from "next/link";

interface Note { id: string; title: string; content: string; wordCount: number; createdAt: string; }
interface Props { nodeId: string; nodeTitle: string; nodeCategory: string; }

export default function NoteEditor({ nodeId, nodeTitle, nodeCategory }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchNotes = useCallback(async () => {
    const res = await fetch(`/api/notes?nodeId=${nodeId}`);
    const data = await res.json();
    setNotes(data.notes || []);
  }, [nodeId]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const saveNote = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), nodeId }),
      });
      setTitle("");
      setContent("");
      setShowEditor(false);
      fetchNotes();
    } catch {}
    setSaving(false);
  };

  return (
    <div className="shore-shell">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-[18px] border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-[13px] text-white/54 transition hover:border-cyan-400/15 hover:text-white/84">
            <ArrowLeft size={14} /> 返回守望台
          </Link>
          <button onClick={() => setShowEditor(!showEditor)} className="inline-flex min-h-11 items-center gap-2 rounded-[18px] border border-cyan-400/16 bg-cyan-400/[0.08] px-4.5 py-2.5 text-[13px] font-medium text-cyan-200 transition hover:bg-cyan-400/[0.12]">
            <Plus size={14} /> {showEditor ? "收起编辑器" : "添加笔记"}
          </button>
        </div>

        <div className="shore-panel p-6 sm:p-7 lg:p-9">
          <div className="mb-8 border-b border-white/[0.08] pb-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300/54">Knowledge Node</p>
            <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="pr-2">
                <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-[-0.02em] text-white/92 sm:text-[2.6rem]">{nodeTitle}</h1>
                <p className="mt-4 max-w-[640px] text-[14px] leading-7 text-white/42">围绕当前知识节点持续沉淀笔记、代码片段与关键结论，让单点学习形成可回溯的航线记录。</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-white/46">
                <span className="shore-badge"><Compass size={12} className="text-cyan-300/72" />{nodeCategory}</span>
                <span className="shore-badge"><NotebookText size={12} className="text-white/54" />{notes.length} 篇笔记</span>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showEditor && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden rounded-[24px] border border-cyan-400/14 bg-white/[0.03] p-4 sm:p-5">
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="笔记标题..." className="mb-3 w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[14px] text-white/88 placeholder-white/24 outline-none transition focus:border-cyan-400/22" />
                <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="支持 Markdown 语法...&#10;&#10;记录你的学习心得、代码片段、关键概念..." rows={10} className="mb-3 w-full resize-none rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 font-mono text-[13px] leading-7 text-white/76 placeholder-white/20 outline-none transition focus:border-cyan-400/22" />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-[11px] text-white/28">{content.replace(/\s/g, "").length} 字</span>
                  <button onClick={saveNote} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/16 bg-cyan-400/[0.1] px-5 py-2.5 text-[13px] font-medium text-cyan-200 transition hover:bg-cyan-400/[0.14] disabled:opacity-50">
                    <Send size={13} /> {saving ? "保存中..." : "保存笔记"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            {notes.length === 0 && !showEditor && (
              <div className="rounded-[24px] border border-dashed border-white/[0.08] bg-white/[0.02] px-6 py-14 text-center">
                <FileText size={28} className="mx-auto mb-3 text-white/12" />
                <p className="text-[15px] text-white/40">这个知识节点还没有任何笔记</p>
                <p className="mt-2 text-[12px] leading-6 text-white/24">点击「添加笔记」开始你的第一次学习记录。</p>
              </div>
            )}

            {notes.map((note, idx) => (
              <motion.div key={note.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="rounded-[24px] border border-white/[0.06] bg-white/[0.025] p-5 transition hover:border-cyan-400/10 hover:bg-white/[0.04]">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-[16px] font-semibold text-white/84">{note.title}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-white/28">
                    <Clock size={10} /> {new Date(note.createdAt).toLocaleDateString("zh-CN")}
                    <span>·</span>
                    <span>{note.wordCount}字</span>
                  </div>
                </div>
                <div className="max-w-none text-[13px] leading-7 text-white/58 [&_code]:rounded-lg [&_code]:bg-white/[0.06] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-cyan-200/70 [&_strong]:text-white/78">
                  {note.content.split("\n").map((line, i) => <p key={i}>{line || <br />}</p>)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

