"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import TiptapLink from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import { createLowlight } from "lowlight";
import { common } from "lowlight";
import {
  ArrowLeft,
  Bold,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Code2,
  Compass,
  Copy,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  LoaderCircle,
  NotebookPen,
  Plus,
  Quote,
  Sparkles,
  Trash2,
} from "lucide-react";
import { saveNoteDraft, deleteNote } from "@/app/notes/[slug]/actions";

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
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex h-8 w-8 items-center justify-center rounded-[6px] transition ${active ? "bg-cyan-400/14 text-cyan-200" : "text-white/50 hover:bg-white/[0.06] hover:text-white/80"}`}
    >
      {children}
    </button>
  );
}

function EditorToolbar({ editor, onInsertImage, onInsertLink }: { editor: Editor | null; onInsertImage: () => void; onInsertLink: () => void }) {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-0.5 border-b border-white/[0.06] px-3 py-2">
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="标题1"><Heading1 size={15} /></ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="标题2"><Heading2 size={15} /></ToolbarButton>
      <div className="mx-1 h-4 w-px bg-white/[0.08]" />
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="加粗"><Bold size={15} /></ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="斜体"><Italic size={15} /></ToolbarButton>
      <div className="mx-1 h-4 w-px bg-white/[0.08]" />
      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="列表"><List size={15} /></ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="引用"><Quote size={15} /></ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="代码块"><Code2 size={15} /></ToolbarButton>
      <div className="mx-1 h-4 w-px bg-white/[0.08]" />
      <ToolbarButton onClick={onInsertImage} title="插入图片"><ImageIcon size={15} /></ToolbarButton>
      <ToolbarButton onClick={onInsertLink} active={editor.isActive("link")} title="插入链接"><Link2 size={15} /></ToolbarButton>
    </div>
  );
}

export default function NoteEditor({ slug, nodeId, nodeTitle, nodeCategory, initialNotes }: Props) {
  const router = useRouter();
  const [notes, setNotes] = useState<NoteItem[]>(initialNotes);
  const [activeId, setActiveId] = useState(initialNotes[0]?.id ?? "draft");
  const [title, setTitle] = useState(initialNotes[0]?.title ?? "");
  const [linkPreview, setLinkPreview] = useState<LinkPreview | null>(null);
  const [saveState, setSaveState] = useState("未保存");
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeNote = useMemo(() => notes.find((item) => item.id === activeId) ?? null, [notes, activeId]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({ placeholder: "开始写点什么..." }),
      CodeBlockLowlight.configure({ lowlight }),
      TiptapLink.configure({ openOnClick: false, HTMLAttributes: { class: "text-cyan-300/80 underline underline-offset-2 hover:text-cyan-200 transition" } }),
      TiptapImage.configure({ HTMLAttributes: { class: "rounded-[8px] max-w-full my-4" } }),
    ],
    content: activeNote?.content || "",
    editorProps: {
      attributes: {
        class: "editor-content min-h-[400px] max-w-none outline-none px-5 py-4 sm:px-8 sm:py-6",
      },
    },
    onUpdate({ editor: currentEditor }) {
      const html = currentEditor.getHTML();
      const found = html.match(/https?:\/\/[^\s<]+/i)?.[0] ?? null;
      setLinkPreview(found ? createPreview(found) : null);
      setSaveState("编辑中...");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        startTransition(async () => {
          const result = await saveNoteDraft({
            id: activeNote?.id,
            slug,
            nodeId,
            title: title.trim() || activeNote?.title || "未命名笔记",
            content: html,
          });
          setSaveState("已自动保存");
          const updatedAt = result.updatedAt;
          setNotes((prev) => {
            const existing = prev.find((item) => item.id === result.noteId);
            const nextNote: NoteItem = {
              id: result.noteId,
              title: title.trim() || activeNote?.title || "未命名笔记",
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
    editor.commands.setContent(activeNote?.content || "", { emitUpdate: false });
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
    setSaveState("新笔记");
  }

  function handleInsertImage() {
    const url = window.prompt("请输入图片 URL：");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }

  function handleInsertLink() {
    const url = window.prompt("请输入链接 URL：");
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }

  async function handleDeleteNote() {
    if (!activeNote || activeId === "draft") return;
    const confirmed = window.confirm(`确定要删除笔记「${activeNote.title}」吗？此操作不可撤销。`);
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      await deleteNote(activeNote.id, slug);
      setNotes((prev) => prev.filter((n) => n.id !== activeNote.id));
      const remaining = notes.filter((n) => n.id !== activeNote.id);
      if (remaining.length > 0) {
        setActiveId(remaining[0].id);
      } else {
        setActiveId("draft");
        setTitle("");
        editor?.commands.clearContent();
      }
      setSaveState("已删除");
    } catch {
      alert("删除失败，请重试。");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="shore-shell">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-5">
        {/* 顶栏 */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="inline-flex w-fit items-center gap-2 rounded-[8px] border border-white/[0.07] bg-white/[0.03] px-3.5 py-2 text-[13px] text-white/55 transition hover:border-cyan-400/14 hover:text-white/80">
            <ArrowLeft size={14} /> 返回首页
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-white/[0.04] px-2.5 py-1.5 text-[11px] text-white/50">
              <Compass size={11} className="text-cyan-300/65" />{nodeCategory}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-white/[0.04] px-2.5 py-1.5 text-[11px] text-white/50">
              <NotebookPen size={11} className="text-white/55" />{notes.length} 篇笔记
            </span>
            <button onClick={createNewDraft} className="inline-flex items-center gap-1.5 rounded-[8px] border border-cyan-400/14 bg-cyan-400/[0.06] px-3.5 py-2 text-[12px] font-medium text-cyan-200 transition hover:bg-cyan-400/[0.1]">
              <Plus size={14} /> 新建
            </button>
          </div>
        </div>

        {/* 主体 */}
        <div className="overflow-hidden rounded-[14px] border border-white/[0.06] bg-[rgba(13,20,35,0.7)]">
          <div className="grid min-h-[780px] grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)]">
            {/* 左侧笔记列表 */}
            <aside className="border-b border-white/[0.06] bg-[rgba(10,16,28,0.5)] xl:border-b-0 xl:border-r">
              <div className="border-b border-white/[0.06] px-4 py-4">
                <h1 className="text-[15px] font-semibold text-white/88">{nodeTitle}</h1>
                <p className="mt-0.5 font-mono text-[10px] tracking-[0.06em] text-white/30">Note Timeline</p>
              </div>
              <div className="space-y-1 p-3">
                {notes.length === 0 ? (
                  <div className="rounded-[8px] border border-dashed border-white/[0.08] bg-white/[0.02] px-4 py-8 text-center">
                    <Sparkles size={18} className="mx-auto text-cyan-200/50" />
                    <p className="mt-3 text-[13px] text-white/55">还没有笔记</p>
                    <p className="mt-1 text-[11px] text-white/30">开始记录你的第一篇笔记吧</p>
                  </div>
                ) : (
                  notes.map((note) => (
                    <button
                      key={note.id}
                      onClick={() => setActiveId(note.id)}
                      className={`w-full rounded-[8px] px-3.5 py-3 text-left transition ${activeId === note.id ? "bg-cyan-400/[0.08] text-white" : "text-white/70 hover:bg-white/[0.04]"}`}
                    >
                      <p className="line-clamp-1 text-[13px] font-medium">{note.title}</p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-white/35">
                        <span>{formatDate(note.createdAt)}</span>
                        <span>{note.wordCount}字</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </aside>

            {/* 右侧编辑区 */}
            <section className="flex flex-col bg-[rgba(18,25,42,0.5)]">
              {/* 标题输入区 */}
              <div className="border-b border-white/[0.06] px-5 py-5 sm:px-8">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="笔记标题..."
                  className="w-full bg-transparent text-[1.5rem] font-semibold leading-[1.25] tracking-[-0.01em] text-white/92 outline-none placeholder:text-white/25 sm:text-[1.75rem]"
                />
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1 text-white/40">
                    <Clock3 size={11} className="text-cyan-300/60" />{saveState}
                  </span>
                  {isPending && <span className="inline-flex items-center gap-1 text-white/40"><LoaderCircle size={11} className="animate-spin text-cyan-300/60" />保存中</span>}
                  {activeNote?.updatedAt && !isPending && <span className="inline-flex items-center gap-1 text-white/40"><CheckCircle2 size={11} className="text-emerald-300/60" />{formatDate(activeNote.updatedAt)}</span>}
                  {activeNote && activeId !== "draft" && (
                    <button
                      onClick={handleDeleteNote}
                      disabled={isDeleting}
                      className="ml-auto inline-flex items-center gap-1 rounded-[6px] px-2 py-1 text-red-400/60 transition hover:bg-red-400/[0.08] hover:text-red-300 disabled:opacity-40"
                    >
                      <Trash2 size={11} /> {isDeleting ? "删除中..." : "删除"}
                    </button>
                  )}
                </div>
              </div>

              {/* 工具栏 */}
              <EditorToolbar editor={editor} onInsertImage={handleInsertImage} onInsertLink={handleInsertLink} />

              {/* 编辑器 */}
              <div className="flex-1 overflow-y-auto">
                <EditorContent editor={editor} />
              </div>

              {/* 链接预览 */}
              {linkPreview && (
                <div className="border-t border-white/[0.06] px-5 py-3 sm:px-8">
                  <a href={linkPreview.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-[8px] bg-white/[0.03] px-3.5 py-3 transition hover:bg-white/[0.05]">
                    <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-cyan-400/[0.06] text-cyan-300/65">
                      <Link2 size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-white/80">{linkPreview.title}</p>
                      <p className="truncate text-[11px] text-white/35">{linkPreview.url}</p>
                    </div>
                  </a>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

