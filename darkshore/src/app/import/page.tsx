"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  FileJson2,
  Loader2,
  Upload,
  XCircle,
} from "lucide-react";

interface PreviewTopic {
  label: string;
  subtopics: string[];
}

interface PreviewResult {
  ok: boolean;
  name: string;
  totalTopics: number;
  totalSubtopics: number;
  topics: PreviewTopic[];
}

interface ImportResult {
  ok: boolean;
  name: string;
  category: string;
  totalTopics: number;
  totalSubtopics: number;
  totalCreated: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RoadmapRawJSON = { nodes: any[]; edges: any[] };

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState<RoadmapRawJSON | null>(null);
  const [roadmapName, setRoadmapName] = useState("");
  const [category, setCategory] = useState("");
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(null);
    setImportResult(null);
    setError(null);

    const nameGuess = f.name.replace(/\.json$/, "");
    setRoadmapName(nameGuess);
    setCategory(nameGuess.toLowerCase().replace(/\s+/g, "-"));

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!parsed.nodes || !parsed.edges) {
          setError("JSON 文件格式不正确：需要包含 nodes 和 edges 数组");
          return;
        }
        setJsonData(parsed);
      } catch {
        setError("无法解析 JSON 文件，请确认格式正确");
      }
    };
    reader.readAsText(f);
  }, []);

  const handlePreview = useCallback(async () => {
    if (!jsonData) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/import-roadmap?preview=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonData, roadmapName, category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "预览失败");
      setPreview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "预览失败");
    } finally {
      setLoading(false);
    }
  }, [jsonData, roadmapName, category]);

  const handleImport = useCallback(async () => {
    if (!jsonData) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/import-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonData, roadmapName, category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "导入失败");
      setImportResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "导入失败");
    } finally {
      setLoading(false);
    }
  }, [jsonData, roadmapName, category]);

  return (
    <div className="mx-auto min-h-screen max-w-[860px] px-5 py-6 lg:px-8 lg:py-8">
      {/* 顶部导航 */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-[8px] border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-[13px] text-white/60 transition hover:border-cyan-400/14 hover:text-cyan-300"
        >
          <ArrowLeft size={14} />
          返回首页
        </Link>
      </div>

      {/* 标题 */}
      <div className="mb-6">
        <h1 className="text-[24px] font-bold text-white/90">导入知识路线图</h1>
        <p className="mt-2 text-[14px] leading-7 text-white/50">
          从 <a href="https://roadmap.sh" target="_blank" rel="noopener noreferrer" className="text-cyan-300/70 underline">roadmap.sh</a>{" "}
          下载路线图 JSON 文件，上传后系统将自动解析并生成知识节点。
        </p>
      </div>

      {/* 导入成功 */}
      {importResult && (
        <div className="shore-panel mb-6 border-emerald-400/20 bg-emerald-400/[0.04] p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} className="mt-0.5 text-emerald-300" />
            <div>
              <h3 className="text-[16px] font-semibold text-emerald-200">导入成功</h3>
              <p className="mt-1 text-[13px] text-white/60">
                已创建 {importResult.totalCreated} 个知识节点（{importResult.totalTopics} 个主题 +{" "}
                {importResult.totalSubtopics} 个子知识点），分类为 <code className="rounded bg-white/[0.08] px-1.5 py-0.5 text-cyan-300/80">{importResult.category}</code>
              </p>
              <Link
                href="/observatory"
                className="mt-3 inline-flex items-center gap-2 rounded-[8px] border border-cyan-400/16 bg-cyan-400/[0.07] px-4 py-2 text-[13px] font-medium text-cyan-200 transition hover:bg-cyan-400/[0.12]"
              >
                前往知识星图查看
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="shore-panel mb-6 border-red-400/20 bg-red-400/[0.04] p-4">
          <div className="flex items-center gap-2 text-[13px] text-red-200">
            <XCircle size={16} />
            {error}
          </div>
        </div>
      )}

      {/* 上传与设置区 */}
      {!importResult && (
        <div className="shore-panel overflow-hidden">
          {/* 文件上传 */}
          <div className="border-b border-white/[0.06] p-6">
            <label className="flex cursor-pointer flex-col items-center gap-3 rounded-[10px] border-2 border-dashed border-white/[0.1] bg-white/[0.02] px-6 py-10 transition hover:border-cyan-400/20 hover:bg-white/[0.04]">
              <FileJson2 size={32} className="text-white/30" />
              <div className="text-center">
                <p className="text-[14px] font-medium text-white/70">
                  {file ? file.name : "点击上传 roadmap.sh JSON 文件"}
                </p>
                <p className="mt-1 text-[12px] text-white/35">
                  支持从 roadmap.sh 仓库导出的 React Flow JSON 格式
                </p>
              </div>
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* 路线图名称与分类 */}
          {jsonData && (
            <div className="border-b border-white/[0.06] p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-white/55">路线图名称</label>
                  <input
                    type="text"
                    value={roadmapName}
                    onChange={(e) => setRoadmapName(e.target.value)}
                    placeholder="如：Frontend, Backend"
                    className="w-full rounded-[8px] border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-[14px] text-white/85 outline-none placeholder:text-white/25 focus:border-cyan-400/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-white/55">分类标识</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="如：frontend, backend"
                    className="w-full rounded-[8px] border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-[14px] text-white/85 outline-none placeholder:text-white/25 focus:border-cyan-400/20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          {jsonData && (
            <div className="flex items-center gap-3 p-6">
              <button
                onClick={handlePreview}
                disabled={loading}
                className="flex items-center gap-2 rounded-[8px] border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-[13px] font-medium text-white/70 transition hover:bg-white/[0.08] disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <FileJson2 size={14} />}
                预览解析结果
              </button>
              {preview && (
                <button
                  onClick={handleImport}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-[8px] border border-cyan-400/16 bg-cyan-400/[0.07] px-4 py-2.5 text-[13px] font-medium text-cyan-200 transition hover:bg-cyan-400/[0.12] disabled:opacity-50"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  确认导入
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 预览结果 */}
      {preview && !importResult && (
        <div className="shore-panel mt-6 overflow-hidden">
          <div className="border-b border-white/[0.06] px-6 py-4">
            <h3 className="text-[16px] font-semibold text-white/85">解析预览</h3>
            <p className="mt-1 text-[13px] text-white/50">
              检测到 <span className="font-semibold text-cyan-300">{preview.totalTopics}</span> 个主题节点，
              <span className="font-semibold text-cyan-300">{preview.totalSubtopics}</span> 个子知识点
            </p>
          </div>
          <div className="max-h-[480px] overflow-y-auto p-6">
            <div className="space-y-4">
              {preview.topics.map((topic, i) => (
                <div key={i} className="rounded-[8px] border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/[0.1] text-[11px] font-bold text-cyan-300">
                      {i + 1}
                    </span>
                    <h4 className="text-[14px] font-semibold text-white/85">{topic.label}</h4>
                    <span className="text-[11px] text-white/35">{topic.subtopics.length} 个子知识点</span>
                  </div>
                  {topic.subtopics.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 pl-8">
                      {topic.subtopics.map((sub, j) => (
                        <span
                          key={j}
                          className="rounded-[4px] bg-white/[0.05] px-2 py-0.5 text-[11px] text-white/55"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="shore-panel mt-6 p-6">
        <h3 className="text-[15px] font-semibold text-white/75">如何获取路线图 JSON 文件？</h3>
        <ol className="mt-3 space-y-2 text-[13px] leading-6 text-white/55">
          <li className="flex gap-2">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-bold text-white/50">1</span>
            <span>访问 <a href="https://github.com/kamranahmedse/developer-roadmap" target="_blank" rel="noopener noreferrer" className="text-cyan-300/70 underline">roadmap.sh 开源仓库</a></span>
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-bold text-white/50">2</span>
            <span>进入 <code className="rounded bg-white/[0.08] px-1.5 py-0.5 text-cyan-300/70">src/data/roadmaps/</code> 目录，选择你要学习的路线图</span>
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-bold text-white/50">3</span>
            <span>下载对应的 JSON 文件（如 <code className="rounded bg-white/[0.08] px-1.5 py-0.5 text-cyan-300/70">frontend.json</code>）</span>
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-bold text-white/50">4</span>
            <span>在本页面上传该文件，预览解析结果后确认导入</span>
          </li>
        </ol>
      </div>
    </div>
  );
}

