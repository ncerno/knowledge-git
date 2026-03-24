import fs from "node:fs/promises";
import path from "node:path";
import NoteReader from "./NoteReader";

interface NotePageProps {
  params: Promise<{ slug: string }>;
}

function parseFrontmatter(markdown: string) {
  // 移除 BOM 字符
  const cleaned = markdown.replace(/^\uFEFF/, "");
  if (!cleaned.startsWith("---")) {
    return { meta: {} as Record<string, string>, content: markdown };
  }
  const [, rawMeta, ...rest] = cleaned.split("---");
  const meta = rawMeta
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, line) => {
      const index = line.indexOf(":");
      if (index === -1) return acc;
      acc[line.slice(0, index).trim()] = line.slice(index + 1).trim().replace(/^"|"$/g, "");
      return acc;
    }, {});
  return { meta, content: rest.join("---").trim() };
}

function renderMarkdown(content: string): string {
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let processed = content.replace(codeBlockRegex, (_match, lang, code) => {
    const escaped = code.replace(/</g, "&lt;").replace(/>/g, "&gt;").trimEnd();
    return `<pre class="code-block" data-lang="${lang}"><code>${escaped}</code></pre>`;
  });

  return processed
    .split("\n")
    .map((line) => {
      if (line.startsWith("<pre") || line.startsWith("</pre>") || line.startsWith("<code")) return line;
      if (line.startsWith("### ")) return `<h3>${inlineFormat(line.slice(4))}</h3>`;
      if (line.startsWith("## ")) return `<h2>${inlineFormat(line.slice(3))}</h2>`;
      if (line.startsWith("# ")) return `<h1>${inlineFormat(line.slice(2))}</h1>`;
      if (line.startsWith("> ")) return `<blockquote>${inlineFormat(line.slice(2))}</blockquote>`;
      if (line.startsWith("- [ ] ")) return `<li>☐ ${inlineFormat(line.slice(6))}</li>`;
      if (line.startsWith("- [x] ")) return `<li>☑ ${inlineFormat(line.slice(6))}</li>`;
      if (line.startsWith("- ")) return `<li>• ${inlineFormat(line.slice(2))}</li>`;
      if (/^\d+\.\s/.test(line)) return `<li>${inlineFormat(line.replace(/^\d+\.\s/, ""))}</li>`;
      if (line.startsWith("---")) return `<hr />`;
      if (!line.trim()) return "<br />";
      return `<p>${inlineFormat(line)}</p>`;
    })
    .join("");
}

function inlineFormat(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

export default async function NotePage({ params }: NotePageProps) {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), "notes", `${slug}.md`);

  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const { meta, content } = parseFrontmatter(fileContent);
    const htmlContent = renderMarkdown(content);

    return <NoteReader meta={meta} slug={slug} htmlContent={htmlContent} />;
  } catch {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="glass rounded-2xl p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-amber-300/70">Signal Lost</p>
          <h1 className="mt-3 text-2xl font-bold text-white/90">未找到对应笔记</h1>
          <p className="mt-3 text-sm leading-6 text-white/50">
            当前星图节点已发出引导信号，但对应的 Markdown 笔记文件尚未落地。请在 <code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300/80">notes/{slug}.md</code> 中补充内容。
          </p>
          <a href="/" className="mt-6 inline-block rounded-lg bg-cyan-400/15 px-4 py-2 text-xs font-medium text-cyan-300 transition hover:bg-cyan-400/25">
            返回守望台
          </a>
        </div>
      </div>
    );
  }
}
