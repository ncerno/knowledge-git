"use client";
import { useMemo } from "react";
import { domainMeta, type NodeCategory } from "@/lib/data/initialRoadmaps";

interface Props { data: Record<string, number> }

const DOMAINS: NodeCategory[] = ["frontend", "backend", "ai", "gamedev", "python"];
const SIZE = 140;
const CENTER = SIZE / 2;
const RADIUS = 52;

function polarToCart(angle: number, r: number) {
  return { x: CENTER + r * Math.cos(angle - Math.PI / 2), y: CENTER + r * Math.sin(angle - Math.PI / 2) };
}

export default function SyncRadar({ data }: Props) {
  const maxVal = Math.max(1, ...Object.values(data));

  const axes = useMemo(() => DOMAINS.map((d, i) => {
    const angle = (Math.PI * 2 * i) / DOMAINS.length;
    const end = polarToCart(angle, RADIUS);
    const label = polarToCart(angle, RADIUS + 14);
    const point = polarToCart(angle, RADIUS * ((data[d] || 0) / maxVal));
    return { key: d, end, label, point, meta: domainMeta[d] };
  }), [data, maxVal]);

  const dataPath = axes.map((a, i) => `${i === 0 ? "M" : "L"} ${a.point.x} ${a.point.y}`).join(" ") + " Z";
  const rings = [0.25, 0.5, 0.75, 1].map((r) => DOMAINS.map((_, i) => {
    const p = polarToCart((Math.PI * 2 * i) / DOMAINS.length, RADIUS * r);
    return `${p.x},${p.y}`;
  }).join(" "));

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-white/72">领域同步率</p>
          <p className="mt-1 text-[12px] leading-5 text-white/42">比较不同领域下的内容沉淀数量。</p>
        </div>
        <div className="rounded-[14px] border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-right">
          <p className="text-[10px] text-white/40">峰值</p>
          <p className="mt-1 text-sm font-semibold text-white/86">{maxVal}</p>
        </div>
      </div>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="mx-auto mt-4 w-full max-w-[190px]">
        {rings.map((pts, i) => <polygon key={i} points={pts} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} />)}
        {axes.map((a) => <line key={a.key} x1={CENTER} y1={CENTER} x2={a.end.x} y2={a.end.y} stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} />)}
        <path d={dataPath} fill="rgba(34,211,238,0.12)" stroke="rgba(103,232,249,0.72)" strokeWidth={1.5} />
        {axes.map((a) => <circle key={a.key} cx={a.point.x} cy={a.point.y} r={2.5} fill="rgba(103,232,249,0.92)" />)}
        {axes.map((a) => (
          <text key={a.key} x={a.label.x} y={a.label.y} textAnchor="middle" dominantBaseline="middle" fontSize={7} fill="rgba(255,255,255,0.42)" fontFamily="Inter">
            {a.meta.label.slice(0, 3)}
          </text>
        ))}
      </svg>
      <div className="mt-3 grid grid-cols-5 gap-1 text-center">
        {axes.map((a) => (
          <div key={a.key} className="rounded-[10px] border border-white/[0.05] bg-white/[0.02] px-1 py-2 text-[10px]">
            <p className="text-white/35">{a.meta.label.slice(0, 2)}</p>
            <span className="mt-1 block text-cyan-300/58">{data[a.key] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
