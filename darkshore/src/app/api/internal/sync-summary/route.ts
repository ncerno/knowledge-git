// ─── 黑海岸·守望站 — AI 学习总结同步后门 ───
// 仅限 AI 助手调用，推送学习报告到前端
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET || "darkshore-amethyst-2025";

export async function POST(req: NextRequest) {
  try {
    // 简易鉴权
    const auth = req.headers.get("x-internal-secret");
    if (auth !== INTERNAL_SECRET) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const { type, period, content } = await req.json();
    if (!type || !period || !content) {
      return NextResponse.json({ error: "type, period, content 均必填" }, { status: 400 });
    }

    const summary = await prisma.learningSummary.upsert({
      where: { type_period: { type, period } },
      update: { content, source: "ai" },
      create: { type, period, content, source: "ai" },
    });

    return NextResponse.json({ summary }, { status: 200 });
  } catch (err) {
    console.error("[sync-summary] POST error:", err);
    return NextResponse.json({ error: "同步总结失败" }, { status: 500 });
  }
}

// GET: 获取总结列表
export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get("type") || "weekly";
    const summaries = await prisma.learningSummary.findMany({
      where: { type },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return NextResponse.json({ summaries });
  } catch (err) {
    console.error("[sync-summary] GET error:", err);
    return NextResponse.json({ error: "获取总结失败" }, { status: 500 });
  }
}

