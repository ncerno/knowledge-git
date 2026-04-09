"use client";
import { useMemo } from "react";

interface Props { data: Record<string, number> }

export default function Heatmap({ data }: Props) {
  const weeks = useMemo(() => {
    const cells: { date: string; count: number; col: number; row: number }[] = [];
    const today = new Date();
    for (let i = 0; i < 126; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - (125 - i));
      const ds = d.toISOString().slice(0, 10);
      cells.push({ date: ds, count: data[ds] || 0, col: Math.floor(i / 7), row: d.getDay() });
    }
    return cells;
  }, [data]);

  const total = weeks.reduce((sum, item) => sum + item.count, 0);
  const maxCount = Math.max(1, ...weeks.map((w) => w.count));

  const getColor = (count: number) => {
    if (count === 0) return "rgba(255,255,255,0.035)";
    const intensity = Math.min(count / maxCount, 1);
    if (intensity < 0.33) return "rgba(34,211,238,0.18)";
    if (intensity < 0.66) return "rgba(34,211,238,0.34)";
    return "rgba(103,232,249,0.72)";
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-white/72">学习热力图</p>
          <p className="mt-1 text-[12px] leading-5 text-white/42">用过去 18 周的记录密度观察学习节奏。</p>
        </div>
        <div className="rounded-[14px] border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-right">
          <p className="text-[10px] text-white/40">记录数</p>
          <p className="mt-1 text-sm font-semibold text-white/86">{total}</p>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto pb-1">
        <div className="flex min-w-max gap-[4px]">
          {Array.from({ length: 18 }, (_, col) => (
            <div key={col} className="flex flex-col gap-[3px]">
              {Array.from({ length: 7 }, (_, row) => {
                const cell = weeks.find((w) => w.col === col && w.row === row);
                return <div key={row} className="h-[10px] w-[10px] rounded-[3px] transition-colors" style={{ background: getColor(cell?.count || 0) }} title={cell ? `${cell.date}: ${cell.count} 条记录` : ""} />;
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-[10px] text-white/35">
        <span>少</span>
        {["rgba(255,255,255,0.035)", "rgba(34,211,238,0.18)", "rgba(34,211,238,0.34)", "rgba(103,232,249,0.72)"].map((c, i) => <div key={i} className="h-[8px] w-[8px] rounded-[2px]" style={{ background: c }} />)}
        <span>多</span>
      </div>
    </div>
  );
}
