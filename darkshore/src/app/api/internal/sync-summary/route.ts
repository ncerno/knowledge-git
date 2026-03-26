import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { renderSummaryMarkdown } from "@/lib/summaryMarkdown";

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET || "darkshore-amethyst-2025";

function checkSecret(req: NextRequest) {
  const auth = req.headers.get("x-internal-secret") || req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return auth === INTERNAL_SECRET;
}

function normalizePayload(body: Record<string, unknown>) {
  const type = String(body.type || "weekly");
  const period = String(body.period || "");
  const category = body.category ? String(body.category) : type === "domain" ? period : null;
  const title = String(body.title || `${type}-${period}`);
  const content = String(body.content || "").trim();
  const excerpt = content.replace(/[#>*`\-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);
  return { type, period, category, title, content, excerpt };
}

export async function POST(req: NextRequest) {
  try {
    if (!checkSecret(req)) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const payload = normalizePayload(await req.json());
    if (!payload.period || !payload.content) {
      return NextResponse.json({ error: "period 与 content 必填" }, { status: 400 });
    }

    const summary = await prisma.learningSummary.upsert({
      where: { type_period: { type: payload.type, period: payload.period } },
      update: {
        title: payload.title,
        category: payload.category,
        content: payload.content,
        contentHtml: renderSummaryMarkdown(payload.content),
        excerpt: payload.excerpt,
        source: "amethyst",
        status: "published",
      },
      create: {
        type: payload.type,
        period: payload.period,
        title: payload.title,
        category: payload.category,
        content: payload.content,
        contentHtml: renderSummaryMarkdown(payload.content),
        excerpt: payload.excerpt,
        source: "amethyst",
        status: "published",
      },
    });

    await prisma.studyLog.create({
      data: {
        date: new Date().toISOString().slice(0, 10),
        duration: 0,
        category: payload.category || payload.type,
        action: "summary",
        source: "ai",
        inputType: payload.type,
        periodKey: payload.period,
        metadata: JSON.stringify({ title: payload.title }),
      },
    });

    return NextResponse.json({ ok: true, summary }, { status: 200 });
  } catch (err) {
    console.error("[sync-summary] POST error:", err);
    return NextResponse.json({ error: "同步总结失败" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get("type") || "weekly";
    const category = req.nextUrl.searchParams.get("category") || undefined;
    const summaries = await prisma.learningSummary.findMany({
      where: { type, ...(category ? { category } : {}) },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 12,
    });
    return NextResponse.json({ summaries }, { status: 200 });
  } catch (err) {
    console.error("[sync-summary] GET error:", err);
    return NextResponse.json({ error: "获取总结失败" }, { status: 500 });
  }
}

