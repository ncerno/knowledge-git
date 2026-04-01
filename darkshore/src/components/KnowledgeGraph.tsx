"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Compass, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { initialRoadmaps, domainMeta, type NodeCategory } from "@/lib/data/initialRoadmaps";

interface Props {
  activeDomain: NodeCategory;
  highlightNodeId?: string | null;
  litNodeIds?: string[];
  notedNodeIds?: string[];
}

const ST = {
  locked: { fill: "rgba(100,116,139,0.42)", glow: "rgba(100,116,139,0.12)" },
  available: { fill: "rgba(255,255,255,0.82)", glow: "rgba(255,255,255,0.14)" },
  completed: { fill: "rgba(34,211,238,0.92)", glow: "rgba(34,211,238,0.35)" },
  noted: { fill: "rgba(103,232,249,0.98)", glow: "rgba(34,211,238,0.4)" },
} as const;

const LEGEND = [
  { label: "未解锁", tone: "bg-slate-400/55" },
  { label: "可学习", tone: "bg-white/80" },
  { label: "已完成 / 已笔记", tone: "bg-cyan-300" },
];

type Particle = { x: number; y: number; vx: number; vy: number; life: number; mx: number; sz: number; c: string };

export default function KnowledgeGraph({ activeDomain, highlightNodeId, litNodeIds = [], notedNodeIds = [] }: Props) {
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);
  const canRef = useRef<HTMLCanvasElement>(null);
  const pRef = useRef<Particle[]>([]);
  const raf = useRef(0);
  const [dims, setDims] = useState({ w: 1200, h: 800 });
  const [hov, setHov] = useState<string | null>(null);
  const [cam, setCam] = useState({ x: 0, y: 0, s: 1 });
  const drg = useRef(false);
  const ds = useRef({ x: 0, y: 0, cx: 0, cy: 0 });
  const noted = useMemo(() => new Set(notedNodeIds), [notedNodeIds]);

  const { nodes, links } = useMemo(() => {
    const mapped = initialRoadmaps.map((n) => {
      const center = domainMeta[n.category].center;
      return { ...n, x: center.x + n.posX * 240, y: center.y + n.posY * 180 };
    });
    return { nodes: mapped, links: mapped.filter((n) => n.prerequisiteId).map((n) => ({ s: n.prerequisiteId!, t: n.id })) };
  }, []);

  useEffect(() => {
    const fn = () => {
      const rect = boxRef.current?.getBoundingClientRect();
      if (rect) setDims({ w: rect.width, h: rect.height });
    };
    fn();
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => {
    const target = domainMeta[activeDomain].center;
    setCam((p) => ({ ...p, x: -target.x, y: -target.y, s: 1.15 }));
  }, [activeDomain]);

  useEffect(() => {
    if (!highlightNodeId) return;
    const node = nodes.find((item) => item.id === highlightNodeId);
    if (node) setCam({ x: -node.x, y: -node.y, s: 1.4 });
  }, [highlightNodeId, nodes]);

  const onPD = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-node]")) return;
    drg.current = true;
    ds.current = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [cam.x, cam.y]);

  const onPM = useCallback((e: React.PointerEvent) => {
    if (!drg.current) return;
    setCam((p) => ({ ...p, x: ds.current.cx + (e.clientX - ds.current.x) / cam.s, y: ds.current.cy + (e.clientY - ds.current.y) / cam.s }));
  }, [cam.s]);

  const onPU = useCallback(() => {
    drg.current = false;
  }, []);

  const onWh = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setCam((p) => ({ ...p, s: Math.max(0.35, Math.min(3, p.s * (1 - e.deltaY * 0.001))) }));
  }, []);

  const spawn = useCallback((cx: number, cy: number) => {
    for (let i = 0; i < 24; i += 1) {
      const angle = (Math.PI * 2 * i) / 24 + (Math.random() - 0.5) * 0.5;
      const speed = 1.5 + Math.random() * 3;
      pRef.current.push({ x: cx, y: cy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, mx: 35 + Math.random() * 25, sz: 2 + Math.random() * 2.5, c: Math.random() > 0.5 ? "103,232,249" : "34,211,238" });
    }
  }, []);

  const tn = useMemo(() => nodes.map((n) => ({
    ...n,
    sx: dims.w / 2 + (n.x + cam.x) * cam.s,
    sy: dims.h / 2 + (n.y + cam.y) * cam.s,
    r: (n.depth === 0 ? 12 : 5 + n.weight * 2.8) * cam.s,
    act: n.category === activeDomain,
    hl: n.id === highlightNodeId,
    lit: litNodeIds.includes(n.id),
    hasN: noted.has(n.id),
  })), [nodes, dims, cam, activeDomain, highlightNodeId, litNodeIds, noted]);

  const tnR = useRef(tn);
  tnR.current = tn;

  useEffect(() => {
    if (!litNodeIds.length) return;
    litNodeIds.forEach((id) => {
      const node = tnR.current.find((item) => item.id === id);
      if (node) spawn(node.sx, node.sy);
    });
  }, [litNodeIds, spawn]);

  useEffect(() => {
    const canvas = canRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const loop = () => {
      canvas.width = dims.w;
      canvas.height = dims.h;
      ctx.clearRect(0, 0, dims.w, dims.h);
      pRef.current = pRef.current
        .map((p) => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vx: p.vx * 0.96, vy: p.vy * 0.96, life: p.life + 1 }))
        .filter((p) => p.life < p.mx);
      pRef.current.forEach((p) => {
        const alpha = 1 - p.life / p.mx;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.sz * alpha, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.c},${alpha * 0.8})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.sz * alpha * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.c},${alpha * 0.1})`;
        ctx.fill();
      });
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [dims]);

  const fd = (id: string) => tn.find((n) => n.id === id);
  const gs = (n: typeof tn[number]) => (n.hasN || n.lit ? ST.noted : ST[n.status as keyof typeof ST] || ST.locked);
  const activeStats = useMemo(() => ({ total: tn.filter((n) => n.category === activeDomain && n.depth > 0).length, notedCount: tn.filter((n) => n.category === activeDomain && (n.hasN || n.lit)).length }), [tn, activeDomain]);

  return (
    <div
      ref={boxRef}
      className="relative h-full w-full cursor-grab overflow-hidden rounded-[14px] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.018))] active:cursor-grabbing"
      onPointerDown={onPD}
      onPointerMove={onPM}
      onPointerUp={onPU}
      onWheel={onWh}
      style={{ touchAction: "none" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(103,232,249,0.08),transparent_26%),radial-gradient(circle_at_78%_28%,rgba(56,189,248,0.05),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.015),transparent_55%)]" />
      <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${dims.w} ${dims.h}`}>

        <defs>
          <linearGradient id="sl" x1="0%" y1="0%" x2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="50%" stopColor="rgba(34,211,238,0.42)" />
            <stop offset="100%" stopColor="rgba(96,165,250,0.06)" />
          </linearGradient>
          <filter id="hlg">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {links.map((l) => {
          const a = fd(l.s);
          const b = fd(l.t);
          if (!a || !b) return null;
          const active = a.act || b.act;
          return (
            <line
              key={l.s + l.t}
              x1={a.sx}
              y1={a.sy}
              x2={b.sx}
              y2={b.sy}
              stroke="url(#sl)"
              strokeOpacity={active ? 0.8 : 0.22}
              strokeWidth={active ? 1.35 : 0.8}
              strokeDasharray="7 10"
            >
              <animate attributeName="stroke-dashoffset" from="34" to="0" dur="2.6s" repeatCount="indefinite" />
            </line>
          );
        })}
        {tn.map((n) => {
          const state = gs(n);
          const opacity = n.act ? 1 : 0.34;
          const isHover = hov === n.id;
          return (
            <g
              key={n.id}
              data-node
              style={{ cursor: n.slug ? "pointer" : "default" }}
              onClick={() => n.slug && router.push(`/notes/${n.slug}`)}
              onMouseEnter={() => setHov(n.id)}
              onMouseLeave={() => setHov(null)}
              filter={n.hl ? "url(#hlg)" : undefined}
            >
              <circle cx={n.sx} cy={n.sy} r={n.r * 2.2} fill={state.glow} opacity={opacity}>
                {(n.hasN || n.lit) && <animate attributeName="r" values={`${n.r * 1.8};${n.r * 2.6};${n.r * 1.8}`} dur="2s" repeatCount="indefinite" />}
                <animate attributeName="opacity" values={`${opacity * 0.2};${opacity * 0.5};${opacity * 0.2}`} dur="3s" repeatCount="indefinite" />
              </circle>
              {n.hl && (
                <circle cx={n.sx} cy={n.sy} r={n.r * 3} fill="none" stroke="rgba(103,232,249,0.62)" strokeWidth={2}>
                  <animate attributeName="r" values={`${n.r * 2};${n.r * 3.5};${n.r * 2}`} dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              <circle
                cx={n.sx}
                cy={n.sy}
                r={isHover ? n.r * 1.28 : n.r}
                fill={state.fill}
                opacity={opacity}
                stroke={n.hl ? "rgba(103,232,249,0.8)" : n.act ? "rgba(255,255,255,0.35)" : "none"}
                strokeWidth={n.hl ? 2 : n.act ? 1 : 0}
                style={{ transition: "r 0.2s ease,fill 0.3s ease" }}
              />
              <text
                x={n.sx + n.r + 10}
                y={n.sy + 4}
                fill={n.hasN ? "rgba(186,230,253,0.98)" : n.hl ? "rgba(125,211,252,0.98)" : n.act ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.54)"}
                fontSize={n.depth === 0 ? 16 : n.hl ? 13.5 : 12.5}
                fontWeight={n.hasN || n.hl ? 600 : 500}
                className="select-none"
              >
                {n.title}
              </text>
              {isHover && n.description && (
                <foreignObject x={n.sx + n.r + 8} y={n.sy + 12} width={220} height={82}>
                  <div className="rounded-[8px] border border-white/10 bg-[rgba(7,12,24,0.92)] px-3 py-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.3)] backdrop-blur-md">
                    <p className="text-[10px] font-medium text-white/55">节点描述</p>
                    <p className="mt-1 text-[11px] leading-5 text-white/65">{n.description}</p>
                  </div>
                </foreignObject>
              )}
            </g>
          );
        })}
      </svg>
      <canvas ref={canRef} className="pointer-events-none absolute inset-0 h-full w-full" width={dims.w} height={dims.h} />

      <motion.div
        className="absolute left-5 right-5 top-5 rounded-[10px] bg-[rgba(15,22,38,0.85)] px-5 py-4 backdrop-blur-xl sm:right-auto sm:max-w-[430px] sm:px-5 sm:py-4"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 pr-2">
            <p className="text-[13px] font-medium text-white/80">知识星图</p>
            <p className="mt-0.5 font-mono text-[10px] tracking-[0.08em] text-white/35">Knowledge Constellation</p>
            <h3 className="mt-2.5 text-[1.1rem] font-semibold leading-7 text-white">
              {domainMeta[activeDomain].label}
              <span className="ml-2 text-[13px] font-medium text-white/60">星域</span>
            </h3>
            <p className="mt-1.5 max-w-[300px] text-[13px] leading-6 text-white/68">{domainMeta[activeDomain].description}</p>
          </div>
          <div className="hidden shrink-0 rounded-[8px] bg-white/[0.05] px-3.5 py-2.5 sm:block">
            <p className="text-[10px] text-white/55">进度</p>
            <p className="mt-1 text-base font-semibold text-white">{activeStats.notedCount}/{activeStats.total}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {LEGEND.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-2 rounded-[6px] bg-white/[0.05] px-3 py-1.5 text-[11px] text-white/70">
              <span className={`h-2 w-2 rounded-full ${item.tone}`} />
              {item.label}
            </span>
          ))}
        </div>
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#101827]/74 via-[#101827]/20 to-transparent" />
      <div className="absolute bottom-5 left-5 max-w-[252px] rounded-[8px] bg-[rgba(15,22,38,0.82)] px-3.5 py-2.5 text-[12px] leading-5 text-white/65 backdrop-blur-md sm:max-w-none">
        <div className="flex items-start gap-2.5">
          <Compass size={14} className="mt-0.5 shrink-0 text-cyan-200/90" />
          <span>拖拽平移 · 滚轮缩放 · 点击节点进入笔记</span>
        </div>
      </div>
      <div className="absolute bottom-5 right-5 flex items-center gap-2">
        <button onClick={() => setCam((p) => ({ ...p, x: -domainMeta[activeDomain].center.x, y: -domainMeta[activeDomain].center.y, s: 1.15 }))} className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[rgba(15,22,38,0.82)] text-white/70 backdrop-blur-md transition duration-200 hover:bg-cyan-400/[0.1] hover:text-white">
          <RotateCcw size={14} />
        </button>
        <button onClick={() => setCam((p) => ({ ...p, s: Math.min(3, p.s * 1.2) }))} className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[rgba(15,22,38,0.82)] text-white/70 backdrop-blur-md transition duration-200 hover:bg-cyan-400/[0.1] hover:text-white">
          <ZoomIn size={14} />
        </button>
        <button onClick={() => setCam((p) => ({ ...p, s: Math.max(0.35, p.s / 1.2) }))} className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[rgba(15,22,38,0.82)] text-white/70 backdrop-blur-md transition duration-200 hover:bg-cyan-400/[0.1] hover:text-white">
          <ZoomOut size={14} />
        </button>
      </div>
    </div>
  );
}
