import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";
import NoteReader from "./NoteReader";
import NoteEditorPage from "./NoteEditorPage";
import { initialRoadmaps } from "@/lib/data/initialRoadmaps";

interface NotePageProps {
  params: Promise<{ slug: string }>;
}

function parseFrontmatter(markdown: string) {
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
    const node = initialRoadmaps.find((n) => n.slug === slug);
    if (node) {
      return <NoteEditorPage nodeId={node.id} nodeTitle={node.title} nodeCategory={node.category} />;
    }
    return (
      <div className="shore-shell">
        <div className="mx-auto max-w-3xl shore-panel p-8 text-center sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-300/18 bg-amber-300/[0.06]">
            <Compass size={20} className="text-amber-200/78" />
          </div>
          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.28em] text-amber-300/70">Signal Lost</p>
          <h1 className="mt-3 text-2xl font-semibold text-white/92 sm:text-3xl">未找到对应笔记</h1>
          <p className="mx-auto mt-3 max-w-xl text-[14px] leading-7 text-white/46">
            未找到与 <code className="rounded-lg bg-white/[0.08] px-2 py-1 text-cyan-300/80">{slug}</code> 对应的知识节点或笔记文件，请返回守望台重新选择航线。
          </p>
          <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-cyan-400/16 bg-cyan-400/[0.08] px-5 py-2.5 text-[13px] font-medium text-cyan-200 transition hover:bg-cyan-400/[0.12]">
            <ArrowLeft size={14} /> 返回守望台
          </Link>
        </div>
      </div>
    );
  }
}
