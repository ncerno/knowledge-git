import fs from "node:fs/promises";
import path from "node:path";
import GlassCard from "@/components/GlassCard";

interface NotePageProps {
  params: Promise<{ slug: string }>;
}

function parseFrontmatter(markdown: string) {
  if (!markdown.startsWith("---")) {
    return { meta: {} as Record<string, string>, content: markdown };
  }

  const [, rawMeta, ...rest] = markdown.split("---");
  const meta = rawMeta
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, line) => {
      const index = line.indexOf(":");
      if (index === -1) return acc;
      const key = line.slice(0, index).trim();
      const value = line.slice(index + 1).trim().replace(/^"|"$/g, "");
      acc[key] = value;
      return acc;
    }, {});

  return { meta, content: rest.join("---").trim() };
}

function renderMarkdown(content: string) {
  return content
    .split("\n")
    .map((line) => {
      if (line.startsWith("# ")) return `<h1>${line.slice(2)}</h1>`;
      if (line.startsWith("## ")) return `<h2>${line.slice(3)}</h2>`;
      if (line.startsWith("> ")) return `<blockquote>${line.slice(2)}</blockquote>`;
      if (line.startsWith("- [ ] ")) return `<li>☐ ${line.slice(6)}</li>`;
      if (line.startsWith("- ")) return `<li>• ${line.slice(2)}</li>`;
      if (!line.trim()) return "<br />";
      return `<p>${line}</p>`;
    })
    .join("");
}

export default async function NotePage({ params }: NotePageProps) {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), "notes", `${slug}.md`);

  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const { meta, content } = parseFrontmatter(fileContent);

    return (
      <div className="mx-auto max-w-4xl px-6 py-10 md:px-8">
        <GlassCard accentBar padding="p-8" className="overflow-hidden">
          <div className="mb-8 border-b border-white/8 pb-6">
            <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-cyan-300/65">Knowledge Note</p>
            <h1 className="mt-3 text-3xl font-bold text-white/90">{meta.title ?? slug}</h1>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/45">
              {meta.domain && <span className="rounded-full border border-cyan-400/20 px-3 py-1">{meta.domain}</span>}
              {meta.createdAt && <span className="rounded-full border border-white/10 px-3 py-1">{meta.createdAt}</span>}
            </div>
          </div>

          <article
            className="prose prose-invert max-w-none text-white/80 [&_blockquote]:border-l-2 [&_blockquote]:border-cyan-400/40 [&_blockquote]:pl-4 [&_blockquote]:text-white/60 [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_li]:ml-4 [&_li]:list-none [&_p]:my-3 [&_p]:leading-7"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        </GlassCard>
      </div>
    );
  } catch {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <GlassCard accentBar padding="p-8">
          <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-amber-300/70">Signal Lost</p>
          <h1 className="mt-3 text-2xl font-bold text-white/90">未找到对应笔记</h1>
          <p className="mt-3 text-sm leading-6 text-white/50">
            当前星图节点已发出引导信号，但对应的 Markdown 笔记文件尚未落地。请在 <code>notes/{slug}.md</code> 中补充内容。
          </p>
        </GlassCard>
      </div>
    );
  }
}

