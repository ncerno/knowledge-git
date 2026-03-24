"use client";
import { useMemo } from "react";

interface Props { data: Record<string, number> }

export default function Heatmap({ data }: Props) {
  const weeks = useMemo(() => {
    const cells: { date: string; count: number; col: number; row: number }[] = [];
    const today = new Date();
    for (let i = 0; i < 126; i++) { // 18 weeks
      const d = new Date(today);
      d.setDate(d.getDate() - (125 - i));
      const ds = d.toISOString().slice(0, 10);
      const dayOfWeek = d.getDay();
      const weekIdx = Math.floor(i / 7);
      cells.push({ date: ds, count: data[ds] || 0, col: weekIdx, row: dayOfWeek });
    }
    return cells;
  }, [data]);

  const maxCount = Math.max(1, ...weeks.map(w => w.count));

  const getColor = (count: number) => {
    if (count === 0) return "rgba(255,255,255,0.03)";
    const intensity = Math.min(count / maxCount, 1);
    if (intensity < 0.33) return "rgba(0,229,255,0.15)";
    if (intensity < 0.66) return "rgba(0,229,255,0.35)";
    return "rgba(0,229,255,0.65)";
  };

  return (
    <div>
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-400/40">
        ✦ 学习热力图
      </p>
      <div className="flex gap-[3px]">
        {Array.from({ length: 18 }, (_, col) => (
          <div key={col} className="flex flex-col gap-[3px]">
            {Array.from({ length: 7 }, (_, row) => {
              const cell = weeks.find(w => w.col === col && w.row === row);
              return (
                <div
                  key={row}
                  className="h-[10px] w-[10px] rounded-[2px] transition-colors"
                  style={{ background: getColor(cell?.count || 0) }}
                  title={cell ? `${cell.date}: ${cell.count} 条记录` : ""}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2 text-[10px] text-white/25">
        <span>少</span>
        {["rgba(255,255,255,0.03)", "rgba(0,229,255,0.15)", "rgba(0,229,255,0.35)", "rgba(0,229,255,0.65)"].map((c, i) => (
          <div key={i} className="h-[8px] w-[8px] rounded-[2px]" style={{ background: c }} />
        ))}
        <span>多</span>
      </div>
    </div>
  );
}

