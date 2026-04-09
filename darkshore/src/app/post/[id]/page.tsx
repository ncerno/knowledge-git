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
      <div className="shore-shell py-8">
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
          <Link href="/" className="mt-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2.5 text-[13px] font-medium text-cyan-100 transition hover:bg-cyan-300/16">
            <ArrowLeft size={14} /> 返回首页
          </Link>
        </div>
      </div>
    );
  }

  const tags = parseTags(note.tags);
  const isNodeNote = !!note.nodeId;
  const related = note.nodeId
    ? await prisma.note.findMany({
        where: { nodeId: note.nodeId, NOT: { id: note.id } },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { id: true, title: true },
      })
    : [];

  return (
    <div className="shore-container py-8 sm:py-10">
      <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10">
        <article className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center gap-3 text-[12px] text-white/44">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 transition hover:border-cyan-300/25 hover:text-white/90"
            >
              <ArrowLeft size={13} /> 返回首页
            </Link>
            {isNodeNote && note.node && (
              <Link
                href={`/notes/${note.node.slug || note.nodeId}`}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3.5 py-2 text-cyan-100 transition hover:bg-cyan-300/16"
              >
                <PenLine size={13} /> 编辑关联笔记
              </Link>
            )}
          </div>

          <header className="shore-panel px-6 py-7 sm:px-9 sm:py-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium ${isNodeNote ? "bg-cyan-300/12 text-cyan-100" : "bg-violet-300/14 text-violet-100"}`}>
                {isNodeNote ? "学习笔记" : "博客文章"}
              </span>
              {note.node && <span className="text-[12px] text-white/42">{note.node.title}</span>}
            </div>
            <h1 className="mt-5 max-w-[850px] text-[2rem] font-semibold leading-[1.14] tracking-[-0.04em] text-white sm:text-[2.7rem]">
              {note.title}
            </h1>
            <p className="mt-4 max-w-[720px] text-[15px] leading-8 text-white/62">
              {note.summary || "这篇内容记录了当前主题下的思考、知识提炼与相关笔记沉淀。"}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-white/46">
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={12} /> {formatDate(note.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={12} /> 约 {Math.max(1, Math.ceil(note.wordCount / 320))} 分钟阅读
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Tag size={12} /> {note.wordCount} 字
              </span>
            </div>
            {tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-[11px] text-white/56">
                    <Hash size={10} />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="mt-6 rounded-[24px] border border-white/8 bg-[rgba(8,15,29,0.68)] px-6 py-8 sm:px-9 sm:py-10">
            <div className="shore-prose" dangerouslySetInnerHTML={{ __html: note.content }} />
          </div>
        </article>

        <aside className="grid gap-4 self-start lg:sticky lg:top-6">
          <div className="shore-card px-5 py-5">
            <p className="shore-eyebrow">Reading Context</p>
            <p className="mt-3 text-[15px] font-semibold text-white">当前内容属于黑海岸的持续沉淀。</p>
            <p className="mt-2 text-[13px] leading-7 text-white/62">
              文章页现在更强调阅读感和内容主次，而不是控制台式的面板堆叠。
            </p>
          </div>

          {related.length > 0 && (
            <div className="shore-card px-5 py-5">
              <p className="shore-eyebrow">Related Notes</p>
              <div className="mt-4 space-y-3">
                {related.map((item) => (
                  <Link key={item.id} href={`/post/${item.id}`} className="block rounded-[14px] border border-white/8 bg-white/[0.02] px-4 py-3 text-[13px] text-white/70 transition hover:bg-white/[0.05] hover:text-white">
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
