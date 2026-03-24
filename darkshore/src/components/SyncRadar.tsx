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
    const val = (data[d] || 0) / maxVal;
    const point = polarToCart(angle, RADIUS * val);
    return { key: d, angle, end, label, point, val, meta: domainMeta[d] };
  }), [data, maxVal]);

  const dataPath = axes.map((a, i) => `${i === 0 ? "M" : "L"} ${a.point.x} ${a.point.y}`).join(" ") + " Z";

  // Concentric rings
  const rings = [0.25, 0.5, 0.75, 1].map(r => {
    const pts = DOMAINS.map((_, i) => {
      const p = polarToCart((Math.PI * 2 * i) / DOMAINS.length, RADIUS * r);
      return `${p.x},${p.y}`;
    }).join(" ");
    return pts;
  });

  return (
    <div>
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-400/40">
        ✦ 领域同步率
      </p>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="mx-auto w-full max-w-[180px]">
        {/* Grid rings */}
        {rings.map((pts, i) => (
          <polygon key={i} points={pts} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} />
        ))}
        {/* Axes */}
        {axes.map(a => (
          <line key={a.key} x1={CENTER} y1={CENTER} x2={a.end.x} y2={a.end.y} stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} />
        ))}
        {/* Data area */}
        <path d={dataPath} fill="rgba(0,229,255,0.12)" stroke="rgba(0,229,255,0.6)" strokeWidth={1.5} />
        {/* Data points */}
        {axes.map(a => (
          <circle key={a.key} cx={a.point.x} cy={a.point.y} r={2.5} fill="rgba(0,229,255,0.9)" />
        ))}
        {/* Labels */}
        {axes.map(a => (
          <text key={a.key} x={a.label.x} y={a.label.y} textAnchor="middle" dominantBaseline="middle"
            fontSize={7} fill="rgba(255,255,255,0.4)" fontFamily="Inter">
            {a.meta.label.slice(0, 3)}
          </text>
        ))}
      </svg>
      <div className="mt-2 grid grid-cols-5 gap-1 text-center">
        {axes.map(a => (
          <div key={a.key} className="text-[10px]">
            <span className="text-cyan-300/60">{data[a.key] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

