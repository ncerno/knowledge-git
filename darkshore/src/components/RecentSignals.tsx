"use client";
import { FileText, Clock } from "lucide-react";

interface NoteItem {
  id: string;
  title: string;
  createdAt: string;
  wordCount: number;
  node?: { id: string; title: string; category: string } | null;
}

interface Props { notes: NoteItem[] }

const DOMAIN_COLORS: Record<string, string> = {
  frontend: "rgba(0,229,255,0.6)",
  backend:  "rgba(59,130,246,0.6)",
  ai:       "rgba(168,85,247,0.6)",
  gamedev:  "rgba(245,158,11,0.6)",
  python:   "rgba(34,197,94,0.6)",
};

export default function RecentSignals({ notes }: Props) {
  return (
    <div>
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-400/40">
        ✦ 最近信号
      </p>
      {notes.length === 0 ? (
        <div className="rounded-xl bg-white/[0.02] px-3 py-5 text-center">
          <FileText size={18} className="mx-auto mb-2 text-white/12" />
          <p className="text-[11px] text-white/25">暂无笔记信号</p>
          <p className="mt-1 text-[10px] text-white/15">通过星图节点添加第一篇笔记</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => {
            const color = note.node?.category ? DOMAIN_COLORS[note.node.category] || "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.2)";
            const timeAgo = getTimeAgo(note.createdAt);
            return (
              <div key={note.id} className="group rounded-xl border border-white/[0.04] bg-white/[0.02] px-3 py-2.5 transition hover:border-cyan-400/10 hover:bg-white/[0.04]">
                <div className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full" style={{ background: color }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium text-white/70 group-hover:text-white/90">{note.title}</p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-white/25">
                      {note.node && <span className="text-cyan-400/40">{note.node.title}</span>}
                      <span className="flex items-center gap-0.5"><Clock size={9} />{timeAgo}</span>
                      <span>{note.wordCount}字</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}分钟前`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}小时前`;
  const days = Math.floor(hrs / 24);
  return `${days}天前`;
}

