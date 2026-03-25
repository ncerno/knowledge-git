"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight";
import { common } from "lowlight";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Compass,
  Copy,
  Link2,
  LoaderCircle,
  NotebookPen,
  Sparkles,
} from "lucide-react";
import { saveNoteDraft } from "@/app/notes/[slug]/actions";

const lowlight = createLowlight(common);

type NoteItem = {
  id: string;
  title: string;
  content: string;
  summary?: string | null;
  wordCount: number;
  version: number;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  slug: string;
  nodeId: string;
  nodeTitle: string;
  nodeCategory: string;
  initialNotes: NoteItem[];
};

type LinkPreview = {
  url: string;
  hostname: string;
  title: string;
};

function formatDate(date: string) {
  return new Date(date).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function createPreview(url: string): LinkPreview | null {
  try {
    const target = new URL(url);
    return {
      url,
      hostname: target.hostname.replace(/^www\./, ""),
      title: target.hostname.replace(/^www\./, "") + " 学习链接",
    };
  } catch {
    return null;
  }
}

function getPlainText(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function ToolbarButton({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-xs transition ${active ? "border-cyan-400/28 bg-cyan-400/14 text-cyan-100" : "border-white/[0.08] bg-white/[0.04] text-white/62 hover:border-cyan-400/20 hover:text-white/84"}`}
    >
      {children}
    </button>
  );
}

function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })}>H1</ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>H2</ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>列表</ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>引用</ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")}>代码块</ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>加粗</ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>斜体</ToolbarButton>
    </div>
  );
}

export default function NoteEditor({ slug, nodeId, nodeTitle, nodeCategory, initialNotes }: Props) {
  const [notes, setNotes] = useState<NoteItem[]>(initialNotes);
  const [activeId, setActiveId] = useState(initialNotes[0]?.id ?? "draft");
  const [title, setTitle] = useState(initialNotes[0]?.title ?? "");
  const [linkPreview, setLinkPreview] = useState<LinkPreview | null>(null);
  const [saveState, setSaveState] = useState("尚未同步");
  const [isPending, startTransition] = useTransition();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeNote = useMemo(() => notes.find((item) => item.id === activeId) ?? null, [notes, activeId]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "在此记录你的研究日志、代码实验、关键概念与认知拐点…" }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: activeNote?.content || "",
    editorProps: {
      attributes: {
        class: "min-h-[320px] max-w-none outline-none text-[15px] leading-8 text-white/84 [&_.ProseMirror-selectednode]:outline-none [&_h1]:mt-6 [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:mt-5 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:text-xl [&_h3]:font-medium [&_p]:my-3 [&_ul]:my-3 [&_ul]:pl-5 [&_li]:my-2 [&_blockquote]:my-5 [&_blockquote]:border-l-2 [&_blockquote]:border-cyan-400/35 [&_blockquote]:bg-white/[0.03] [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:italic [&_pre]:my-5 [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:border [&_pre]:border-white/[0.08] [&_pre]:bg-[#0b1424] [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-[13px] [&_pre]:text-cyan-100/88 [&_code]:rounded-md [&_code]:bg-white/[0.08] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-cyan-200/85",
      },
    },
    onUpdate({ editor: currentEditor }) {
      const html = currentEditor.getHTML();
      const found = html.match(/https?:\/\/[^\s<]+/i)?.[0] ?? null;
      setLinkPreview(found ? createPreview(found) : null);
      setSaveState("星海回响中…");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        startTransition(async () => {
          const result = await saveNoteDraft({
            id: activeNote?.id,
            slug,
            nodeId,
            title: title.trim() || activeNote?.title || "未命名观测记录",
            content: html,
          });
          setSaveState("已自动同步到星图");
          const updatedAt = result.updatedAt;
          setNotes((prev) => {
            const existing = prev.find((item) => item.id === result.noteId);
            const nextNote: NoteItem = {
              id: result.noteId,
              title: title.trim() || activeNote?.title || "未命名观测记录",
              content: html,
              summary: getPlainText(html).slice(0, 140),
              wordCount: getPlainText(html).replace(/\s/g, "").length,
              version: existing ? existing.version + 1 : 1,
              createdAt: existing?.createdAt || new Date().toISOString(),
              updatedAt,
            };
            return [nextNote, ...prev.filter((item) => item.id !== result.noteId)].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
          });
          setActiveId(result.noteId);
        });
      }, 2000);
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.commands.setContent(activeNote?.content || "", false);
    setTitle(activeNote?.title || "");
    setLinkPreview(createPreview((activeNote?.content || "").match(/https?:\/\/[^\s<]+/i)?.[0] || ""));
  }, [editor, activeNote]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  async function copyCurrentCodeBlocks() {
    if (!editor) return;
    const text = editor.getHTML().match(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/i)?.[1] || "";
    const normalized = text.replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    if (normalized) await navigator.clipboard.writeText(normalized);
  }

  function createNewDraft() {
    setActiveId("draft");
    setTitle("");
    editor?.commands.clearContent();
    setSaveState("新的观测记录正在等待落笔");
  }

  return (
    <div className="shore-shell">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="inline-flex min-h-11 w-fit items-center gap-2 rounded-[18px] border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-[13px] text-white/58 transition hover:border-cyan-400/18 hover:text-white/84">
            <ArrowLeft size={14} /> 返回守望台
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="shore-badge"><Compass size={12} className="text-cyan-300/72" />{nodeCategory}</span>
            <span className="shore-badge"><NotebookPen size={12} className="text-white/70" />{notes.length} 篇研究记录</span>
            <button onClick={createNewDraft} className="inline-flex min-h-11 items-center gap-2 rounded-[18px] border border-cyan-400/16 bg-cyan-400/[0.08] px-4 py-2.5 text-[13px] font-medium text-cyan-200 transition hover:bg-cyan-400/[0.12]">
              <Sparkles size={14} /> 新建观测
            </button>
          </div>
        </div>

        <div className="shore-panel overflow-hidden p-0">
          <div className="grid min-h-[780px] grid-cols-1 xl:grid-cols-[340px_minmax(0,1fr)]">
            <aside className="border-b border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-5 xl:border-b-0 xl:border-r xl:p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-cyan-200/72">点亮时间线</p>
              <h1 className="mt-3 text-[1.9rem] font-semibold leading-[1.12] tracking-[-0.02em] text-white/92">{nodeTitle}</h1>
              <p className="mt-3 text-[14px] leading-7 text-white/52">多篇笔记按时间倒序排列，像研究日志一样，记录这片星域被你逐步点亮的过程。</p>

              <div className="mt-6 space-y-3">
                {notes.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-cyan-400/16 bg-cyan-400/[0.04] px-5 py-8 text-center">
                    <Sparkles size={22} className="mx-auto text-cyan-200/72" />
                    <p className="mt-3 text-[15px] text-white/72">这片星域尚未被观测，期待你的第一次共鸣...</p>
                    <p className="mt-2 text-[12px] leading-6 text-white/42">写下第一条研究记录后，节点会立即被青色荧光点亮。</p>
                  </div>
                ) : (
                  notes.map((note, index) => (
                    <button
                      key={note.id}
                      onClick={() => setActiveId(note.id)}
                      className={`w-full rounded-[22px] border p-4 text-left transition ${activeId === note.id ? "border-cyan-400/24 bg-cyan-400/[0.08]" : "border-white/[0.06] bg-white/[0.025] hover:border-cyan-400/16 hover:bg-white/[0.04]"}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-400/18 bg-cyan-400/[0.08] text-cyan-200/80">{index + 1}</div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-[15px] font-medium text-white/88">{note.title}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-white/42">
                            <span className="inline-flex items-center gap-1"><CalendarDays size={12} /> {formatDate(note.createdAt)}</span>
                            <span>v{note.version}</span>
                            <span>{note.wordCount} 字</span>
                          </div>
                          <p className="mt-2 line-clamp-2 text-[12px] leading-6 text-white/48">{note.summary || "尚未提炼摘要，等待下一次共鸣。"}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </aside>

            <section className="p-5 sm:p-6 lg:p-8">
              <div className="mx-auto max-w-[900px]">
                <div className="border-b border-white/[0.08] pb-6">
                  <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-cyan-200/72">Research Log Editor</p>
                  <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="给这次研究记录起一个标题…"
                        className="w-full bg-transparent text-[2rem] font-semibold leading-[1.15] tracking-[-0.02em] text-white/94 outline-none placeholder:text-white/24 sm:text-[2.6rem]"
                      />
                      <p className="mt-3 max-w-[720px] text-[14px] leading-7 text-white/48">支持 Markdown 快捷键、代码块高亮、自动保存与链接卡片预览，让记录过程更像在经营一座长期演化的知识宇宙。</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-white/48">
                      <span className="shore-badge"><Clock3 size={12} className="text-cyan-300/72" />{saveState}</span>
                      {isPending && <span className="shore-badge"><LoaderCircle size={12} className="animate-spin text-cyan-300/72" />同步中</span>}
                      {activeNote?.updatedAt && !isPending && <span className="shore-badge"><CheckCircle2 size={12} className="text-emerald-300/72" />{formatDate(activeNote.updatedAt)}</span>}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-4 rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <EditorToolbar editor={editor} />
                    <button onClick={copyCurrentCodeBlocks} className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-white/62 transition hover:border-cyan-400/18 hover:text-white/84">
                      <Copy size={13} /> 复制最近代码块
                    </button>
                  </div>
                  <EditorContent editor={editor} />
                </div>

                {linkPreview && (
                  <div className="mt-5 rounded-[24px] border border-cyan-400/16 bg-cyan-400/[0.05] p-4 sm:p-5">
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-200/72">学习链接预览</p>
                    <a href={linkPreview.url} target="_blank" rel="noreferrer" className="mt-3 flex items-start gap-3 rounded-[18px] border border-white/[0.08] bg-[#0c1525]/70 px-4 py-4 transition hover:border-cyan-400/18">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/18 bg-cyan-400/[0.08] text-cyan-200/78">
                        <Link2 size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-medium text-white/88">{linkPreview.title}</p>
                        <p className="mt-1 text-[12px] text-white/42">{linkPreview.hostname}</p>
                        <p className="mt-2 truncate text-[12px] text-cyan-200/72">{linkPreview.url}</p>
                      </div>
                    </a>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

