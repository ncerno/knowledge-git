"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { initialRoadmaps, domainMeta, type NodeCategory, type RawKnowledgeNode } from "@/lib/data/initialRoadmaps";

interface KnowledgeGraphProps {
  activeDomain: NodeCategory;
}

interface RenderNode extends RawKnowledgeNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const NODE_STYLES = {
  locked: { fill: "rgba(148,163,184,0.65)", glow: "rgba(148,163,184,0.25)" },
  available: { fill: "rgba(255,255,255,0.95)", glow: "rgba(255,255,255,0.25)" },
  completed: { fill: "rgba(34,211,238,0.95)", glow: "rgba(34,211,238,0.5)" },
} as const;

export default function KnowledgeGraph({ activeDomain }: KnowledgeGraphProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [camera, setCamera] = useState({ x: 0, y: 0, scale: 1 });

  const { nodes, links } = useMemo(() => {
    const mapped = initialRoadmaps.map<RenderNode>((node) => {
      const center = domainMeta[node.category].center;
      return {
        ...node,
        x: center.x + node.posX * 240,
        y: center.y + node.posY * 180,
        vx: 0,
        vy: 0,
      };
    });

    return {
      nodes: mapped,
      links: mapped
        .filter((node) => node.prerequisiteId)
        .map((node) => ({ source: node.prerequisiteId!, target: node.id })),
    };
  }, []);

  useEffect(() => {
    const resize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) setDimensions({ width: rect.width, height: rect.height });
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const target = domainMeta[activeDomain].center;
    setCamera((prev) => ({ ...prev, x: -target.x, y: -target.y, scale: 1.15 }));
  }, [activeDomain]);

  const transformedNodes = nodes.map((node) => ({
    ...node,
    screenX: dimensions.width / 2 + (node.x + camera.x) * camera.scale,
    screenY: dimensions.height / 2 + (node.y + camera.y) * camera.scale,
    radius: (node.depth === 0 ? 11 : 5 + node.weight * 2.6) * camera.scale,
    isActiveDomain: node.category === activeDomain,
  }));

  const findNode = (id: string) => transformedNodes.find((node) => node.id === id);

  return (
    <div ref={containerRef} className="relative h-[72vh] w-full overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.02] backdrop-blur-sm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,229,255,0.08),transparent_55%)]" />
      <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}>
        <defs>
          <linearGradient id="shore-link" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(34,211,238,0.05)" />
            <stop offset="50%" stopColor="rgba(34,211,238,0.6)" />
            <stop offset="100%" stopColor="rgba(96,165,250,0.08)" />
          </linearGradient>
        </defs>
        {links.map((link) => {
          const source = findNode(link.source);
          const target = findNode(link.target);
          if (!source || !target) return null;
          return (
            <g key={`${link.source}-${link.target}`}>
              <line
                x1={source.screenX}
                y1={source.screenY}
                x2={target.screenX}
                y2={target.screenY}
                stroke="url(#shore-link)"
                strokeOpacity={source.category === activeDomain || target.category === activeDomain ? 0.9 : 0.3}
                strokeWidth={source.category === activeDomain || target.category === activeDomain ? 1.6 : 0.9}
                strokeDasharray="7 10"
              >
                <animate attributeName="stroke-dashoffset" from="34" to="0" dur="2.4s" repeatCount="indefinite" />
              </line>
            </g>
          );
        })}


        {transformedNodes.map((node) => {
          const style = NODE_STYLES[node.status];
          const opacity = node.isActiveDomain ? 1 : 0.38;
          return (
            <g
              key={node.id}
              style={{ cursor: node.slug ? "pointer" : "default" }}
              onClick={() => node.slug && router.push(`/notes/${node.slug}`)}
              onMouseDown={() => setDraggingNode(node.id)}
              onMouseUp={() => setDraggingNode(null)}
            >
              <circle cx={node.screenX} cy={node.screenY} r={node.radius * 2.2} fill={style.glow} opacity={opacity}>
                {node.status === "completed" && (
                  <animate attributeName="r" values={`${node.radius * 1.9};${node.radius * 2.4};${node.radius * 1.9}`} dur="2.8s" repeatCount="indefinite" />
                )}
                <animate attributeName="opacity" values={`${opacity * 0.25};${opacity * 0.6};${opacity * 0.25}`} dur="3s" repeatCount="indefinite" />
              </circle>
              <circle
                cx={node.screenX}
                cy={node.screenY}
                r={node.radius}
                fill={style.fill}
                opacity={opacity}
                stroke={node.isActiveDomain ? "rgba(255,255,255,0.5)" : "transparent"}
                strokeWidth={node.isActiveDomain ? 1 : 0}
              />
              <text
                x={node.screenX + node.radius + 8}
                y={node.screenY + 4}
                fill={node.isActiveDomain ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.35)"}
                fontSize={node.depth === 0 ? 15 : 11}
                className="select-none"
              >
                {node.title}
              </text>
            </g>
          );
        })}
      </svg>

      <motion.div
        className="absolute left-5 top-5 rounded-2xl border border-cyan-400/15 bg-slate-950/40 px-4 py-3 backdrop-blur-md"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-[10px] font-mono tracking-[0.28em] text-cyan-300/70 uppercase">Knowledge Constellation</p>
        <h3 className="mt-2 text-lg font-semibold text-white/90">{domainMeta[activeDomain].label} 星域</h3>
        <p className="mt-1 max-w-sm text-xs text-white/45">{domainMeta[activeDomain].description}</p>
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/45 to-transparent" />
    </div>
  );
}
