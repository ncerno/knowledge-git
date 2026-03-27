import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import NoteEditor from "@/components/NoteEditor";
import { prisma } from "@/lib/db";
import { initialRoadmaps } from "@/lib/data/initialRoadmaps";

interface NotePageProps {
  params: Promise<{ slug: string }>;
}

export default async function NotePage({ params }: NotePageProps) {
  const { slug } = await params;
  const node = initialRoadmaps.find((item) => item.slug === slug);

  if (!node) {
    return (
      <div className="shore-shell">
        <div className="mx-auto max-w-3xl shore-panel p-8 text-center sm:p-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[10px] border border-amber-300/14 bg-amber-300/[0.05]">
            <Compass size={18} className="text-amber-200/72" />
          </div>
          <p className="mt-4 text-[12px] font-medium text-white/55">未找到页面</p>
          <p className="mt-0.5 font-mono text-[10px] tracking-[0.08em] text-white/30">Page Not Found</p>
          <h1 className="mt-3 text-xl font-semibold text-white/88 sm:text-2xl">未找到对应节点</h1>
          <p className="mx-auto mt-2 max-w-xl text-[13px] leading-7 text-white/50">
            未找到与 <code className="rounded-[4px] bg-white/[0.07] px-1.5 py-0.5 text-cyan-300/75">{slug}</code> 对应的知识节点，请返回首页重新选择。
          </p>
          <Link href="/" className="mt-5 inline-flex items-center gap-2 rounded-[8px] border border-cyan-400/14 bg-cyan-400/[0.06] px-4 py-2.5 text-[13px] font-medium text-cyan-200 transition hover:bg-cyan-400/[0.1]">
            <ArrowLeft size={14} /> 返回首页
          </Link>
        </div>
      </div>
    );
  }

  const notes = await prisma.note.findMany({
    where: { nodeId: node.id },
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      content: true,
      summary: true,
      wordCount: true,
      version: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <NoteEditor
      slug={slug}
      nodeId={node.id}
      nodeTitle={node.title}
      nodeCategory={node.category}
      initialNotes={notes.map((note) => ({
        ...note,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
      }))}
    />
  );
}
