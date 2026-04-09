"use client";
import { FileText, Clock } from "lucide-react";
import Link from "next/link";

interface NoteItem {
  id: string;
  title: string;
  createdAt: string;
  wordCount: number;
  node?: { id: string; title: string; category: string } | null;
}

interface Props { notes: NoteItem[] }

const DOMAIN_COLORS: Record<string, string> = {
  frontend: "rgba(34,211,238,0.72)",
  backend: "rgba(59,130,246,0.68)",
  ai: "rgba(168,85,247,0.68)",
  gamedev: "rgba(245,158,11,0.68)",
  python: "rgba(34,197,94,0.68)",
};

export default function RecentSignals({ notes }: Props) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-white/72">最近更新</p>
          <p className="mt-1 text-[12px] leading-5 text-white/42">从最新内容快速回到具体文章。</p>
        </div>
        <div className="rounded-[14px] border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-right">
          <p className="text-[10px] text-white/40">更新</p>
          <p className="mt-1 text-sm font-semibold text-white/86">{notes.length}</p>
        </div>
      </div>
      {notes.length === 0 ? (
        <div className="mt-4 rounded-[16px] border border-dashed border-white/[0.07] bg-white/[0.02] px-3 py-6 text-center">
          <FileText size={18} className="mx-auto mb-2 text-white/15" />
          <p className="text-[11px] text-white/30">暂无笔记信号</p>
          <p className="mt-1 text-[10px] text-white/18">通过星图节点添加第一篇笔记</p>
        </div>
      ) : (
        <div className="mt-4 space-y-2.5">
          {notes.map((note) => {
            const color = note.node?.category ? DOMAIN_COLORS[note.node.category] || "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.2)";
            const timeAgo = getTimeAgo(note.createdAt);
            return (
              <Link key={note.id} href={`/post/${note.id}`} className="group block rounded-[16px] border border-white/[0.05] bg-white/[0.02] px-4 py-3 transition hover:border-cyan-300/14 hover:bg-white/[0.04]">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-white/76 group-hover:text-white/92">{note.title}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-white/28">
                      {note.node && <span className="rounded-full border border-white/[0.06] px-2 py-0.5 text-cyan-300/58">{note.node.title}</span>}
                      <span className="flex items-center gap-1"><Clock size={9} />{timeAgo}</span>
                      <span>{note.wordCount}字</span>
                    </div>
                  </div>
                </div>
              </Link>
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
