"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { initialRoadmaps } from "@/lib/data/initialRoadmaps";

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

async function ensureKnowledgeNode(nodeId: string) {
  const existing = await prisma.knowledgeNode.findUnique({ where: { id: nodeId } });
  if (existing) return existing;

  const roadmapNode = initialRoadmaps.find((item) => item.id === nodeId);
  if (!roadmapNode) {
    throw new Error(`未找到对应知识节点: ${nodeId}`);
  }

  return prisma.knowledgeNode.create({
    data: {
      id: roadmapNode.id,
      title: roadmapNode.title,
      description: roadmapNode.description || null,
      category: roadmapNode.category,
      depth: roadmapNode.depth,
      status: roadmapNode.status,
      isMastered: false,
      slug: roadmapNode.slug || null,
      posX: roadmapNode.posX,
      posY: roadmapNode.posY,
      weight: roadmapNode.weight,
      prerequisiteId: roadmapNode.prerequisiteId || null,
      tags: JSON.stringify(roadmapNode.tags || []),
    },
  });
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

  await ensureKnowledgeNode(input.nodeId);

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

export async function deleteNote(noteId: string, slug: string) {
  if (!noteId) throw new Error("缺少 noteId");

  const note = await prisma.note.findUnique({ where: { id: noteId }, select: { nodeId: true } });
  if (!note) throw new Error("笔记不存在");

  await prisma.note.delete({ where: { id: noteId } });

  // 如果该节点下没有笔记了，把节点状态改回 available
  const remaining = await prisma.note.count({ where: { nodeId: note.nodeId } });
  if (remaining === 0) {
    await prisma.knowledgeNode.update({
      where: { id: note.nodeId },
      data: { isMastered: false, status: "available" },
    });
  }

  revalidatePath(`/notes/${slug}`);
  revalidatePath("/");

  return { ok: true };
}

