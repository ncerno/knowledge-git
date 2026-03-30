// ─────────────────────────────────────────────
// 黑海岸·守望站 — 守望清单 CRUD API
// ─────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET: 获取所有任务（支持 ?status=pending 过滤）
export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status");
    const where = status ? { status } : {};
    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ tasks });
  } catch (err) {
    console.error("[tasks] GET error:", err);
    return NextResponse.json({ error: "获取任务失败" }, { status: 500 });
  }
}

// POST: 创建新任务
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, priority, deadline, relatedNodeId } = body;
    if (!title) {
      return NextResponse.json({ error: "title 是必须的" }, { status: 400 });
    }
    const task = await prisma.task.create({
      data: {
        title,
        description: description ?? null,
        priority: priority ?? 0,
        deadline: deadline ?? null,
        relatedNodeId: relatedNodeId ?? null,
        status: "pending",
      },
    });
    return NextResponse.json({ task }, { status: 201 });
  } catch (err) {
    console.error("[tasks] POST error:", err);
    return NextResponse.json({ error: "创建任务失败" }, { status: 500 });
  }
}

// PATCH: 更新任务状态或其他字段
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: "id 是必须的" }, { status: 400 });
    }
    // 如果状态变为 completed，自动记录完成时间
    if (updates.status === "completed" && !updates.completedAt) {
      updates.completedAt = new Date().toISOString();
    }
    const task = await prisma.task.update({
      where: { id },
      data: updates,
    });
    return NextResponse.json({ task });
  } catch (err) {
    console.error("[tasks] PATCH error:", err);
    return NextResponse.json({ error: "更新任务失败" }, { status: 500 });
  }
}

// DELETE: 删除任务
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id 是必须的" }, { status: 400 });
    }
    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[tasks] DELETE error:", err);
    return NextResponse.json({ error: "删除任务失败" }, { status: 500 });
  }
}

