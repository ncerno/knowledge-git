// ─── 黑海岸·守望站 — 笔记 CRUD API ───
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: 获取笔记列表（?nodeId= 过滤特定节点的笔记）
export async function GET(req: NextRequest) {
  try {
    const nodeId = req.nextUrl.searchParams.get("nodeId");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");
    const where = nodeId ? { nodeId } : {};
    const notes = await prisma.note.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { node: { select: { id: true, title: true, category: true } } },
    });
    return NextResponse.json({ notes });
  } catch (err) {
    console.error("[notes] GET error:", err);
    return NextResponse.json({ error: "获取笔记失败" }, { status: 500 });
  }
}

// POST: 创建笔记
export async function POST(req: NextRequest) {
  try {
    const { title, content, nodeId, tags } = await req.json();
    if (!title) return NextResponse.json({ error: "title 必填" }, { status: 400 });

    const wordCount = (content || "").replace(/\s/g, "").length;
    const note = await prisma.note.create({
      data: { title, content: content || "", nodeId: nodeId || null, tags: JSON.stringify(tags || []), wordCount },
    });

    // 自动记录学习日志
    if (nodeId) {
      const today = new Date().toISOString().slice(0, 10);
      const node = await prisma.knowledgeNode.findUnique({ where: { id: nodeId } });
      await prisma.studyLog.create({
        data: { date: today, duration: 0, category: node?.category || null, nodeId, noteId: note.id, action: "note" },
      });
    }

    return NextResponse.json({ note }, { status: 201 });
  } catch (err) {
    console.error("[notes] POST error:", err);
    return NextResponse.json({ error: "创建笔记失败" }, { status: 500 });
  }
}

// PATCH: 更新笔记
export async function PATCH(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: "id 必填" }, { status: 400 });
    if (updates.content) updates.wordCount = updates.content.replace(/\s/g, "").length;
    const note = await prisma.note.update({ where: { id }, data: updates });
    return NextResponse.json({ note });
  } catch (err) {
    console.error("[notes] PATCH error:", err);
    return NextResponse.json({ error: "更新笔记失败" }, { status: 500 });
  }
}

// DELETE: 删除笔记
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id 必填" }, { status: 400 });
    await prisma.note.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[notes] DELETE error:", err);
    return NextResponse.json({ error: "删除笔记失败" }, { status: 500 });
  }
}

