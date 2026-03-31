import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Compass, Hash, PenLine, Tag } from "lucide-react";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
}

function parseTags(tagsStr: string): string[] {
  try {
    const parsed = JSON.parse(tagsStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;

  const note = await prisma.note.findUnique({
    where: { id },
    include: { node: true },
  });

  if (!note) {
    return (
      <div className="shore-shell">
        <div className="mx-auto max-w-3xl shore-panel p-8 text-center sm:p-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[10px] border border-amber-300/14 bg-amber-300/[0.05]">
            <Compass size={18} className="text-amber-200/72" />
          </div>
          <p className="mt-4 text-[12px] font-medium text-white/55">未找到页面</p>
          <p className="mt-0.5 font-mono text-[10px] tracking-[0.08em] text-white/30">Post Not Found</p>
          <h1 className="mt-3 text-xl font-semibold text-white/88 sm:text-2xl">文章不存在</h1>
          <p className="mx-auto mt-2 max-w-xl text-[13px] leading-7 text-white/50">
            未找到 ID 为 <code className="rounded-[4px] bg-white/[0.07] px-1.5 py-0.5 text-cyan-300/75">{id}</code> 的文章，可能已被删除。
          </p>
          <Link href="/" className="mt-5 inline-flex items-center gap-2 rounded-[8px] border border-cyan-400/14 bg-cyan-400/[0.06] px-4 py-2.5 text-[13px] font-medium text-cyan-200 transition hover:bg-cyan-400/[0.1]">
            <ArrowLeft size={14} /> 返回首页
          </Link>
        </div>
      </div>
    );
  }

  const tags = parseTags(note.tags);
  const isNodeNote = !!note.nodeId;

  return (
    <div className="mx-auto min-h-screen max-w-[860px] px-5 py-6 lg:px-8 lg:py-8">
      {/* 顶部导航 */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-[8px] border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-[13px] text-white/60 transition hover:border-cyan-400/14 hover:text-cyan-300"
        >
          <ArrowLeft size={14} />
          返回首页
        </Link>
        {isNodeNote && note.node && (
          <Link
            href={`/notes/${note.node.slug || note.nodeId}`}
            className="flex items-center gap-2 rounded-[8px] border border-cyan-400/16 bg-cyan-400/[0.07] px-3 py-2 text-[13px] text-cyan-200 transition hover:bg-cyan-400/[0.12]"
          >
            <PenLine size={14} />
            编辑笔记
          </Link>
        )}
      </div>

      {/* 文章内容 */}
      <article className="shore-panel overflow-hidden">
        {/* 文章头部 */}
        <div className="border-b border-white/[0.06] px-6 py-6 sm:px-8 sm:py-8">
          {/* 类型标签 */}
          <div className="mb-4 flex items-center gap-2">
            {isNodeNote ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-400/[0.08] px-2.5 py-0.5 text-[11px] font-medium text-cyan-200/80">
                学习笔记 · {note.node?.category || "未分类"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-400/[0.1] px-2.5 py-0.5 text-[11px] font-medium text-violet-200/80">
                <PenLine size={10} />
                博文
              </span>
            )}
          </div>

          {/* 标题 */}
          <h1 className="text-[26px] font-bold leading-[1.35] tracking-[-0.02em] text-white/92 sm:text-[30px]">
            {note.title}
          </h1>

          {/* 元信息 */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-[12px] text-white/45">
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              {formatDate(note.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={12} />
              约 {Math.ceil(note.wordCount / 300)} 分钟阅读
            </span>
            <span className="flex items-center gap-1.5">
              <Tag size={12} />
              {note.wordCount} 字
            </span>
          </div>

          {/* 标签 */}
          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-[5px] bg-white/[0.05] px-2 py-1 text-[11px] text-white/50">
                  <Hash size={9} />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 文章正文 */}
        <div
          className="prose-editor px-6 py-6 text-[15px] leading-8 text-white/82 sm:px-8 sm:py-8"
          dangerouslySetInnerHTML={{ __html: note.content }}
        />
      </article>
    </div>
  );
}

