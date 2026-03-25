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
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-300/18 bg-amber-300/[0.06]">
            <Compass size={20} className="text-amber-200/78" />
          </div>
          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.28em] text-amber-300/70">Signal Lost</p>
          <h1 className="mt-3 text-2xl font-semibold text-white/92 sm:text-3xl">未找到对应星域</h1>
          <p className="mx-auto mt-3 max-w-xl text-[14px] leading-7 text-white/46">
            未找到与 <code className="rounded-lg bg-white/[0.08] px-2 py-1 text-cyan-300/80">{slug}</code> 对应的知识节点，请返回守望台重新选择航线。
          </p>
          <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-cyan-400/16 bg-cyan-400/[0.08] px-5 py-2.5 text-[13px] font-medium text-cyan-200 transition hover:bg-cyan-400/[0.12]">
            <ArrowLeft size={14} /> 返回守望台
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
