import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseRoadmapJSON } from "@/lib/roadmapParser";

function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jsonData, roadmapName, category } = body;

    if (!jsonData || !jsonData.nodes || !jsonData.edges) {
      return NextResponse.json(
        { error: "无效的路线图 JSON 数据，需包含 nodes 和 edges 数组" },
        { status: 400 }
      );
    }

    const name = (roadmapName || "imported-roadmap").trim();
    const cat = (category || name).toLowerCase().replace(/\s+/g, "-").slice(0, 30);

    // 解析路线图
    const result = parseRoadmapJSON(jsonData, name);

    if (result.totalTopics === 0) {
      return NextResponse.json(
        { error: "未在 JSON 中检测到任何 topic 节点" },
        { status: 400 }
      );
    }

    // 如果只是预览请求（不实际导入）
    const preview = request.nextUrl.searchParams.get("preview") === "true";
    if (preview) {
      return NextResponse.json({
        ok: true,
        preview: true,
        name: result.name,
        totalTopics: result.totalTopics,
        totalSubtopics: result.totalSubtopics,
        topics: result.topics.map((t) => ({
          label: t.label,
          subtopics: t.children.map((c) => c.label),
        })),
      });
    }

    // 实际导入：批量创建 KnowledgeNode
    const createdNodes: { id: string; title: string; depth: number }[] = [];

    for (const topic of result.topics) {
      const topicId = `${cat}-${slugify(topic.label)}-${topic.id.slice(0, 6)}`;
      const topicSlug = `${cat}-${slugify(topic.label)}`;

      // 创建或更新主节点 (topic)
      await prisma.knowledgeNode.upsert({
        where: { id: topicId },
        update: { title: topic.label, posX: topic.posX, posY: topic.posY },
        create: {
          id: topicId,
          title: topic.label,
          description: `${name} 路线图 · ${topic.label}`,
          category: cat,
          depth: 1,
          status: "available",
          slug: topicSlug,
          posX: topic.posX / 100, // 归一化坐标
          posY: topic.posY / 100,
          weight: 1.3,
          tags: JSON.stringify([cat, topic.label.toLowerCase()]),
        },
      });

      createdNodes.push({ id: topicId, title: topic.label, depth: 1 });

      // 创建子节点 (subtopic)
      for (const sub of topic.children) {
        const subId = `${cat}-${slugify(sub.label)}-${sub.id.slice(0, 6)}`;
        const subSlug = `${cat}-${slugify(sub.label)}`;

        await prisma.knowledgeNode.upsert({
          where: { id: subId },
          update: { title: sub.label, posX: sub.posX, posY: sub.posY },
          create: {
            id: subId,
            title: sub.label,
            description: `${topic.label} · ${sub.label}`,
            category: cat,
            depth: 2,
            status: "locked",
            slug: subSlug,
            posX: sub.posX / 100,
            posY: sub.posY / 100,
            weight: 1,
            prerequisiteId: topicId,
            tags: JSON.stringify([cat, topic.label.toLowerCase(), sub.label.toLowerCase()]),
          },
        });

        createdNodes.push({ id: subId, title: sub.label, depth: 2 });
      }
    }

    return NextResponse.json({
      ok: true,
      imported: true,
      name: result.name,
      category: cat,
      totalTopics: result.totalTopics,
      totalSubtopics: result.totalSubtopics,
      totalCreated: createdNodes.length,
      nodes: createdNodes,
    });
  } catch (err) {
    console.error("导入路线图失败:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "导入失败" },
      { status: 500 }
    );
  }
}

