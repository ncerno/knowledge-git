// ─── 黑海岸·守望站 — 博客信息流 API ───
// 获取所有笔记（博客文章+知识节点笔记），按时间倒序
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20");
    const type = req.nextUrl.searchParams.get("type"); // "blog" | "node" | null(全部)
    const tag = req.nextUrl.searchParams.get("tag");
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    // 按类型筛选
    if (type === "blog") {
      where.nodeId = null; // 独立博客文章（不挂载到知识节点）
    } else if (type === "node") {
      where.nodeId = { not: null }; // 知识节点笔记
    }

    // 按标签筛选
    if (tag) {
      where.tags = { contains: tag };
    }

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          node: { select: { id: true, title: true, category: true } },
        },
      }),
      prisma.note.count({ where }),
    ]);

    return NextResponse.json({
      notes: notes.map((note) => ({
        id: note.id,
        title: note.title,
        summary: note.summary,
        tags: note.tags,
        wordCount: note.wordCount,
        nodeId: note.nodeId,
        node: note.node,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("[feed] GET error:", err);
    return NextResponse.json({ error: "获取信息流失败" }, { status: 500 });
  }
}

