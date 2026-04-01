// ─────────────────────────────────────────────
// 黑海岸·守望站 — AI 认知接口 /api/chat
// 支持 Vercel AI SDK 流式输出
// ─────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `你是「守岸人」(Shorekeeper)——黑海岸·个人学习守望站的 AI 向导。
你的职责是帮助用户理解知识节点、规划学习路径、回答技术问题。
你说话温柔沉稳，像海浪轻轻拍打堤岸，同时保持技术上的精准与深度。
回答时请使用中文，适当使用emoji和比喻，但技术术语保留英文。
如果用户提到正在学习的知识节点，请结合该节点的上下游关系给出建议。`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, context } = body as {
      messages: { role: "user" | "assistant" | "system"; content: string }[];
      context?: string; // 当前查看的笔记内容（可选）
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "messages 数组是必须的" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    if (!apiKey) {
      // 没有 API key 时，返回一个友好的 fallback 回复
      return NextResponse.json({
        reply: "🌊 守岸人的认知链路尚未连接。请在 `.env` 中配置 `OPENAI_API_KEY` 来启动 AI 向导。\n\n当前可用功能：知识星图导航、任务管理、笔记阅读。",
      });
    }

    const systemMessages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
    ];
    if (context) {
      systemMessages.push({
        role: "system" as const,
        content: `用户当前正在阅读以下知识笔记，请结合此内容进行引导：\n\n${context.slice(0, 2000)}`,
      });
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [...systemMessages, ...messages],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[chat] LLM API error:", errText);
      return NextResponse.json(
        { error: "AI 服务暂时不可用", detail: errText },
        { status: 502 },
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? "守岸人沉默了片刻...请稍后再试。";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[chat] Error:", err);
    return NextResponse.json(
      { error: "认知接口发生异常" },
      { status: 500 },
    );
  }
}

