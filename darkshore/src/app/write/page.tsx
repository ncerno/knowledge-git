"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEditor, EditorContent } from "@tiptap/react";
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
  CheckCircle2,
  Code2,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  LoaderCircle,
  Quote,
  Save,
} from "lucide-react";
import { saveBlogPost } from "./actions";

const lowlight = createLowlight(common);

export default function WritePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [saving, startSave] = useTransition();
  const [saved, setSaved] = useState(false);
  const [noteId, setNoteId] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({ placeholder: "开始书写你的想法..." }),
      CodeBlockLowlight.configure({ lowlight }),
      TiptapLink.configure({ openOnClick: false }),
      TiptapImage,
    ],
    editorProps: {
      attributes: {
        class: "prose-editor min-h-[400px] outline-none px-6 py-5 text-[15px] leading-8 text-white/88",
      },
    },
  });

  const handleSave = () => {
    if (!editor) return;
    const content = editor.getHTML();
    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    startSave(async () => {
      try {
        const res = await saveBlogPost({
          id: noteId || undefined,
          title: title || "未命名文章",
          content,
          tags,
        });
        if (res.ok) {
          setNoteId(res.noteId);
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        }
      } catch (err) {
        console.error("保存失败:", err);
      }
    });
  };

  const insertImage = () => {
    const url = window.prompt("输入图片URL:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertLink = () => {
    const url = window.prompt("输入链接URL:");
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-[860px] px-5 py-6 lg:px-8 lg:py-8">
      {/* 顶部导航 */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-[8px] border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-[13px] text-white/60 transition hover:border-cyan-400/14 hover:text-cyan-300"
        >
          <ArrowLeft size={14} />
          返回首页
        </Link>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-[12px] text-emerald-300/80">
              <CheckCircle2 size={13} />
              已保存
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-[8px] border border-cyan-400/16 bg-cyan-400/[0.07] px-4 py-2 text-[13px] font-medium text-cyan-200 transition hover:bg-cyan-400/[0.12] disabled:opacity-50"
          >
            {saving ? <LoaderCircle size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "保存中..." : "保存文章"}
          </button>
        </div>
      </div>

      {/* 文章编辑区 */}
      <div className="shore-panel overflow-hidden">
        {/* 标题输入 */}
        <div className="border-b border-white/[0.06] px-6 py-5">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="文章标题"
            className="w-full bg-transparent text-[24px] font-semibold text-white/90 outline-none placeholder:text-white/25"
          />
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="标签（逗号分隔，如：JavaScript, 心得, 教程）"
            className="mt-3 w-full bg-transparent text-[13px] text-white/55 outline-none placeholder:text-white/25"
          />
        </div>

        {/* 工具栏 */}
        {editor && (
          <div className="flex items-center gap-0.5 border-b border-white/[0.06] px-3 py-2">
            {[
              { icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive("heading", { level: 1 }), title: "标题1" },
              { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }), title: "标题2" },
              { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold"), title: "粗体" },
              { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic"), title: "斜体" },
              { icon: Code2, action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive("codeBlock"), title: "代码块" },
              { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList"), title: "列表" },
              { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive("blockquote"), title: "引用" },
              { icon: ImageIcon, action: insertImage, active: false, title: "图片" },
              { icon: Link2, action: insertLink, active: false, title: "链接" },
            ].map((btn, i) => (
              <button
                key={i}
                type="button"
                onClick={btn.action}
                title={btn.title}
                className={`flex h-8 w-8 items-center justify-center rounded-[6px] transition ${
                  btn.active ? "bg-cyan-400/14 text-cyan-200" : "text-white/50 hover:bg-white/[0.06] hover:text-white/80"
                }`}
              >
                <btn.icon size={15} />
              </button>
            ))}
          </div>
        )}

        {/* 编辑器 */}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

