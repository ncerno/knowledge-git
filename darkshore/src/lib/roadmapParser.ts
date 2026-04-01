/**
 * roadmap.sh JSON 解析器
 * 将 React Flow 格式的 roadmap.sh 路线图数据解析为 Darkshore 知识节点
 */

// ─── roadmap.sh 原始 JSON 中的类型 ───

interface RoadmapNode {
  id: string;
  type: string; // "topic" | "subtopic" | "paragraph" | "vertical" | "button" | ...
  position: { x: number; y: number };
  data: {
    label: string;
    style?: Record<string, unknown>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface RoadmapEdge {
  id: string;
  source: string;
  target: string;
  data?: { edgeStyle?: string };
  [key: string]: unknown;
}

interface RoadmapJSON {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
}

// ─── 解析结果类型 ───

export interface ParsedNode {
  id: string;
  label: string;
  type: "topic" | "subtopic";
  posX: number;
  posY: number;
  parentId: string | null;
  children: ParsedNode[];
  order: number;
}

export interface ParseResult {
  name: string;
  topics: ParsedNode[];
  totalTopics: number;
  totalSubtopics: number;
}

// ─── 核心解析逻辑 ───

export function parseRoadmapJSON(
  jsonData: RoadmapJSON,
  roadmapName: string = "imported"
): ParseResult {
  const { nodes, edges } = jsonData;

  // 1. 提取有效节点（topic + subtopic）
  const topicNodes = nodes.filter((n) => n.type === "topic" && n.data.label?.trim());
  const subtopicNodes = nodes.filter((n) => n.type === "subtopic" && n.data.label?.trim());

  // 2. 建立 ID → 节点快速查找表
  const topicIdSet = new Set(topicNodes.map((n) => n.id));
  const subtopicIdSet = new Set(subtopicNodes.map((n) => n.id));

  // 3. 通过 edges 建立 topic → subtopic 的父子关系
  // 规则: source 是 topic，target 是 subtopic => 父子关系
  const parentMap = new Map<string, string>(); // childId -> parentId
  const topicOrder = new Map<string, string[]>(); // topicId -> [predecessor topicIds]

  for (const edge of edges) {
    const sourceIsTopic = topicIdSet.has(edge.source);
    const targetIsSubtopic = subtopicIdSet.has(edge.target);
    const targetIsTopic = topicIdSet.has(edge.target);
    const sourceIsSubtopic = subtopicIdSet.has(edge.source);

    if (sourceIsTopic && targetIsSubtopic) {
      // topic -> subtopic 连线 = 父子关系
      parentMap.set(edge.target, edge.source);
    } else if (sourceIsTopic && targetIsTopic) {
      // topic -> topic 连线 = 学习顺序
      if (!topicOrder.has(edge.target)) topicOrder.set(edge.target, []);
      topicOrder.get(edge.target)!.push(edge.source);
    } else if (sourceIsSubtopic && targetIsSubtopic) {
      // subtopic -> subtopic 连线: 尝试继承父级
      // 暂时不处理，这些通常是同级展示
    }
  }

  // 4. 按 Y 坐标排序 topics (从上到下 = 从先学到后学)
  const sortedTopics = [...topicNodes].sort((a, b) => a.position.y - b.position.y);

  // 5. 组装结果
  const topics: ParsedNode[] = sortedTopics.map((topicNode, index) => {
    // 找到该 topic 下的所有 subtopic
    const childSubtopics = subtopicNodes
      .filter((sub) => parentMap.get(sub.id) === topicNode.id)
      .sort((a, b) => a.position.y - b.position.y);

    const children: ParsedNode[] = childSubtopics.map((sub, subIdx) => ({
      id: sub.id,
      label: sub.data.label.trim(),
      type: "subtopic" as const,
      posX: sub.position.x,
      posY: sub.position.y,
      parentId: topicNode.id,
      children: [],
      order: subIdx,
    }));

    return {
      id: topicNode.id,
      label: topicNode.data.label.trim(),
      type: "topic" as const,
      posX: topicNode.position.x,
      posY: topicNode.position.y,
      parentId: null,
      children,
      order: index,
    };
  });

  // 6. 处理未关联到任何 topic 的 subtopic（孤儿节点）
  const assignedSubtopics = new Set(
    topics.flatMap((t) => t.children.map((c) => c.id))
  );
  const orphanSubtopics = subtopicNodes.filter(
    (s) => !assignedSubtopics.has(s.id)
  );

  // 尝试通过距离将孤儿 subtopic 分配给最近的 topic
  for (const orphan of orphanSubtopics) {
    let closestTopic: ParsedNode | null = null;
    let minDist = Infinity;
    for (const topic of topics) {
      const dx = orphan.position.x - topic.posX;
      const dy = orphan.position.y - topic.posY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        closestTopic = topic;
      }
    }
    if (closestTopic && minDist < 800) {
      closestTopic.children.push({
        id: orphan.id,
        label: orphan.data.label.trim(),
        type: "subtopic",
        posX: orphan.position.x,
        posY: orphan.position.y,
        parentId: closestTopic.id,
        children: [],
        order: closestTopic.children.length,
      });
    }
  }

  return {
    name: roadmapName,
    topics,
    totalTopics: topics.length,
    totalSubtopics: topics.reduce((sum, t) => sum + t.children.length, 0),
  };
}

