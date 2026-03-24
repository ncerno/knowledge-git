// ─── 黑海岸·守望站 — 统计数据 API ───
// 提供热力图、雷达图、最近笔记等数据
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // 1. 热力图数据：最近 180 天的学习记录
    const since = new Date();
    since.setDate(since.getDate() - 180);
    const sinceStr = since.toISOString().slice(0, 10);

    const logs = await prisma.studyLog.findMany({
      where: { date: { gte: sinceStr } },
      select: { date: true, category: true, action: true },
    });

    // 按日聚合
    const heatmap: Record<string, number> = {};
    logs.forEach((log) => {
      heatmap[log.date] = (heatmap[log.date] || 0) + 1;
    });

    // 2. 雷达图数据：每个领域的笔记数量
    const categories = ["frontend", "backend", "ai", "gamedev", "python"];
    const radar: Record<string, number> = {};
    for (const cat of categories) {
      const count = await prisma.note.count({
        where: { node: { category: cat } },
      });
      radar[cat] = count;
    }

    // 3. 最近 5 篇笔记
    const recentNotes = await prisma.note.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        createdAt: true,
        wordCount: true,
        node: { select: { id: true, title: true, category: true } },
      },
    });

    // 4. 各节点笔记数（用于星图变色）
    const nodeNoteCounts = await prisma.note.groupBy({
      by: ["nodeId"],
      where: { nodeId: { not: null } },
      _count: { id: true },
    });
    const litNodes: string[] = nodeNoteCounts
      .filter((n) => n._count.id > 0 && n.nodeId)
      .map((n) => n.nodeId as string);

    return NextResponse.json({
      heatmap,
      radar,
      recentNotes,
      litNodes,
      totalNotes: await prisma.note.count(),
      totalLogs: logs.length,
    });
  } catch (err) {
    console.error("[stats] GET error:", err);
    return NextResponse.json({ error: "获取统计数据失败" }, { status: 500 });
  }
}

