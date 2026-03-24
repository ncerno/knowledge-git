"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Clock, FileText, Send } from "lucide-react";
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
      setTitle(""); setContent(""); setShowEditor(false);
      fetchNotes();
    } catch { /* ignore */ }
    setSaving(false);
  };

  return (
    <div className="mx-auto max-w-[900px] px-6 py-10">
      {/* 顶部 */}
      <div className="mb-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2 text-[13px] text-white/45 transition hover:border-cyan-400/15 hover:text-cyan-300">
          <ArrowLeft size={14} /> 返回守望台
        </Link>
        <button
          onClick={() => setShowEditor(!showEditor)}
          className="flex items-center gap-2 rounded-xl bg-cyan-400/12 px-4 py-2 text-[13px] font-medium text-cyan-300 transition hover:bg-cyan-400/20"
        >
          <Plus size={14} /> 添加笔记
        </button>
      </div>

      {/* 节点信息头 */}
      <div className="mb-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-300/50">Knowledge Node</p>
        <h1 className="mt-2 text-2xl font-bold text-white/90">{nodeTitle}</h1>
        <div className="mt-2 flex items-center gap-3 text-[12px] text-white/35">
          <span className="rounded-full border border-cyan-400/15 px-3 py-0.5">{nodeCategory}</span>
          <span>{notes.length} 篇笔记</span>
        </div>
      </div>

      {/* 编辑器 */}
      <AnimatePresence>
        {showEditor && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden rounded-2xl border border-cyan-400/15 bg-white/[0.03] p-5">
            <input
              value={title} onChange={e => setTitle(e.target.value)}
              placeholder="笔记标题..."
              className="mb-3 w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-[14px] text-white/85 placeholder-white/25 outline-none focus:border-cyan-400/25"
            />
            <textarea
              value={content} onChange={e => setContent(e.target.value)}
              placeholder="支持 Markdown 语法...&#10;&#10;记录你的学习心得、代码片段、关键概念..."
              rows={8}
              className="mb-3 w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 font-mono text-[13px] leading-6 text-white/75 placeholder-white/20 outline-none focus:border-cyan-400/25"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-white/25">{content.replace(/\s/g, "").length} 字</span>
              <button onClick={saveNote} disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-cyan-400/15 px-5 py-2 text-[13px] font-medium text-cyan-300 transition hover:bg-cyan-400/25 disabled:opacity-50">
                <Send size={13} /> {saving ? "保存中..." : "保存笔记"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 笔记列表 */}
      <div className="space-y-4">
        {notes.length === 0 && !showEditor && (
          <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] px-6 py-12 text-center">
            <FileText size={28} className="mx-auto mb-3 text-white/12" />
            <p className="text-[14px] text-white/35">这个知识节点还没有任何笔记</p>
            <p className="mt-1 text-[12px] text-white/20">点击「添加笔记」开始你的第一次学习记录</p>
          </div>
        )}
        {notes.map((note, idx) => (
          <motion.div key={note.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5 transition hover:border-cyan-400/10">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-white/80">{note.title}</h3>
              <div className="flex items-center gap-2 text-[10px] text-white/25">
                <Clock size={10} /> {new Date(note.createdAt).toLocaleDateString("zh-CN")}
                <span>·</span>
                <span>{note.wordCount}字</span>
              </div>
            </div>
            <div className="prose prose-invert max-w-none text-[13px] leading-6 text-white/55 [&_code]:rounded [&_code]:bg-white/[0.06] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-cyan-200/70 [&_strong]:text-white/75">
              {note.content.split("\n").map((line, i) => <p key={i}>{line || <br />}</p>)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

