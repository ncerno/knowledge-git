"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

type SaveBlogPostInput = {
  id?: string;
  title: string;
  content: string;
  summary?: string;
  tags?: string[];
};

function countWords(content: string) {
  return content.replace(/<[^>]+>/g, " ").replace(/\s/g, "").length;
}

function extractSummary(content: string) {
  const plain = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return plain.slice(0, 140) || "新的思考，新的记录...";
}

export async function saveBlogPost(input: SaveBlogPostInput) {
  const title = input.title.trim() || "未命名文章";
  const content = input.content.trim();
  const tags = JSON.stringify(input.tags || []);
  const summary = input.summary?.trim() || extractSummary(content);
  const wordCount = countWords(content);

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
          nodeId: null, // 独立博客文章，不挂载到任何知识节点
          version: 1,
        },
      });

  // 记录学习日志
  await prisma.studyLog.create({
    data: {
      date: new Date().toISOString().slice(0, 10),
      duration: 0,
      category: null,
      nodeId: null,
      noteId: note.id,
      action: "blog",
    },
  });

  revalidatePath("/");
  revalidatePath(`/post/${note.id}`);

  return { ok: true, noteId: note.id, updatedAt: note.updatedAt.toISOString() };
}

export async function deleteBlogPost(noteId: string) {
  if (!noteId) throw new Error("缺少 noteId");

  const note = await prisma.note.findUnique({ where: { id: noteId } });
  if (!note) throw new Error("文章不存在");

  await prisma.note.delete({ where: { id: noteId } });

  revalidatePath("/");
  return { ok: true };
}

