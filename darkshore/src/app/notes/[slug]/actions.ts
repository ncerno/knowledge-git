"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

type SaveNoteInput = {
  id?: string;
  nodeId: string;
  slug: string;
  title: string;
  content: string;
  summary?: string;
  tags?: string[];
  sourceUrl?: string;
};

function countWords(content: string) {
  return content.replace(/<[^>]+>/g, " ").replace(/\s/g, "").length;
}

function extractSummary(content: string) {
  const plain = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return plain.slice(0, 140) || "这片星域尚未被观测，期待你的第一次共鸣...";
}

export async function saveNoteDraft(input: SaveNoteInput) {
  const title = input.title.trim() || "未命名观测记录";
  const content = input.content.trim();
  const tags = JSON.stringify(input.tags || []);
  const summary = input.summary?.trim() || extractSummary(content);
  const wordCount = countWords(content);

  if (!input.nodeId) {
    throw new Error("缺少 nodeId");
  }

  const existingCount = await prisma.note.count({ where: { nodeId: input.nodeId } });

  const note = input.id
    ? await prisma.note.update({
        where: { id: input.id },
        data: {
          title,
          content,
          summary,
          tags,
          wordCount,
          version: { increment: 1 },
        },
      })
    : await prisma.note.create({
        data: {
          title,
          content,
          summary,
          tags,
          wordCount,
          nodeId: input.nodeId,
          version: 1,
        },
      });

  if (existingCount === 0) {
    await prisma.knowledgeNode.update({
      where: { id: input.nodeId },
      data: { isMastered: true, status: "completed" },
    });

    const node = await prisma.knowledgeNode.findUnique({ where: { id: input.nodeId } });
    await prisma.studyLog.create({
      data: {
        date: new Date().toISOString().slice(0, 10),
        duration: 0,
        category: node?.category || null,
        nodeId: input.nodeId,
        noteId: note.id,
        action: "note",
      },
    });
  }

  revalidatePath(`/notes/${input.slug}`);
  revalidatePath("/");

  return { ok: true, noteId: note.id, updatedAt: note.updatedAt.toISOString() };
}

