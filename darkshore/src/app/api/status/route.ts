import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/status — 系统健康检查
export async function GET() {
  const startTime = Date.now();

  let dbStatus: "connected" | "error" = "error";
  let dbLatencyMs = -1;
  let noteCount = 0;
  let skillCount = 0;

  try {
    const dbStart = Date.now();
    // 轻量探针：计数查询
    [noteCount, skillCount] = await Promise.all([
      prisma.note.count(),
      prisma.skill.count(),
    ]);
    dbLatencyMs = Date.now() - dbStart;
    dbStatus = "connected";
  } catch {
    dbStatus = "error";
  }

  return NextResponse.json(
    {
      status: "ok",
      system: "黑海岸·守望站 Dark Shore",
      version: "0.1.0",
      phase: "Phase I — Foundation",
      timestamp: new Date().toISOString(),
      responseMs: Date.now() - startTime,
      services: {
        api: {
          status: "online",
        },
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
          engine: "SQLite (Prisma)",
          stats: {
            notes: noteCount,
            skills: skillCount,
          },
        },
      },
      message:
        dbStatus === "connected"
          ? "所有系统正常。守岸人就绪。"
          : "数据库连接失败，请运行 `npx prisma db push` 初始化数据库。",
    },
    { status: 200 }
  );
}

