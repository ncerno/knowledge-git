// ─── 黑海岸·守望站 — 轻量 Markdown→HTML 渲染器 ───
// 无外部依赖，前后端均可调用
// 支持：H1-H3、有序/无序列表、引用块、行内 code/bold/italic/link

/**
 * 将 Markdown 文本转换为干净的 HTML 字符串
 */
export function renderSummaryMarkdown(input: string): string {
  if (!input || !input.trim()) return "";

  const blocks = input.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);

  return blocks
    .map((block) => {
      // ── 标题 ──
      if (block.startsWith("### ")) return `<h3>${inlineFmt(block.slice(4))}</h3>`;
      if (block.startsWith("## "))  return `<h2>${inlineFmt(block.slice(3))}</h2>`;
      if (block.startsWith("# "))   return `<h1>${inlineFmt(block.slice(2))}</h1>`;

      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);

      // ── 引用块（必须在列表之前，因为 > 开头不会误匹配列表）──
      if (lines.every((l) => /^>\s?/.test(l))) {
        const inner = lines.map((l) => inlineFmt(l.replace(/^>\s?/, ""))).join("<br />");
        return `<blockquote>${inner}</blockquote>`;
      }

      // ── 无序列表 ──
      if (lines.every((l) => /^[-*]\s+/.test(l))) {
        return `<ul>${lines.map((l) => `<li>${inlineFmt(l.replace(/^[-*]\s+/, ""))}</li>`).join("")}</ul>`;
      }

      // ── 有序列表 ──
      if (lines.every((l) => /^\d+\.\s+/.test(l))) {
        return `<ol>${lines.map((l) => `<li>${inlineFmt(l.replace(/^\d+\.\s+/, ""))}</li>`).join("")}</ol>`;
      }

      // ── 普通段落 ──
      return `<p>${inlineFmt(lines.join("<br />"))}</p>`;
    })
    .join("");
}

/**
 * HTML 实体转义（防 XSS，保留 Markdown 语法符号）
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * 行内格式化：先转义 HTML，再替换 Markdown 行内语法
 * 顺序：code → bold → italic → link
 */
function inlineFmt(text: string): string {
  let s = escapeHtml(text);
  // 行内代码（最先处理，内部不再解析其他格式）
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  // 粗体
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // 斜体
  s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  // 链接 [text](url)
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  return s;
}

