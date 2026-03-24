"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { initialRoadmaps, domainMeta, type NodeCategory, type RawKnowledgeNode } from "@/lib/data/initialRoadmaps";

interface KnowledgeGraphProps {
  activeDomain: NodeCategory;
  highlightNodeId?: string | null;
  litNodeIds?: string[];
}

interface RenderNode extends RawKnowledgeNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

const NODE_STYLES = {
  locked: { fill: "rgba(148,163,184,0.65)", glow: "rgba(148,163,184,0.25)" },
  available: { fill: "rgba(255,255,255,0.95)", glow: "rgba(255,255,255,0.25)" },
  completed: { fill: "rgba(34,211,238,0.95)", glow: "rgba(34,211,238,0.5)" },
} as const;

export default function KnowledgeGraph({ activeDomain, highlightNodeId, litNodeIds = [] }: KnowledgeGraphProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
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

  // 域切换 → 平滑移动摄像头
  useEffect(() => {
    const target = domainMeta[activeDomain].center;
    setCamera((prev) => ({ ...prev, x: -target.x, y: -target.y, scale: 1.15 }));
  }, [activeDomain]);

  // 搜索高亮节点 → 平移到该节点
  useEffect(() => {
    if (!highlightNodeId) return;
    const node = nodes.find((n) => n.id === highlightNodeId);
    if (node) {
      setCamera({ x: -node.x, y: -node.y, scale: 1.4 });
    }
  }, [highlightNodeId, nodes]);

  // 粒子爆发：任务完成时点亮节点
  const spawnParticles = useCallback((cx: number, cy: number) => {
    const count = 28;
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
      const speed = 1.5 + Math.random() * 3;
      newParticles.push({
        id: Date.now() + i,
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 40 + Math.random() * 30,
        size: 2 + Math.random() * 3,
        color: Math.random() > 0.5 ? "0,229,255" : "34,211,238",
      });
    }
    particlesRef.current = [...particlesRef.current, ...newParticles];
  }, []);

  // 监听 litNodeIds 变化 → 触发粒子爆发
  useEffect(() => {
    if (litNodeIds.length === 0) return;
    litNodeIds.forEach((nodeId) => {
      const node = transformedNodesRef.current.find((n) => n.id === nodeId);
      if (node) spawnParticles(node.screenX, node.screenY);
    });
  }, [litNodeIds, spawnParticles]);

  const transformedNodes = nodes.map((node) => ({
    ...node,
    screenX: dimensions.width / 2 + (node.x + camera.x) * camera.scale,
    screenY: dimensions.height / 2 + (node.y + camera.y) * camera.scale,
    radius: (node.depth === 0 ? 11 : 5 + node.weight * 2.6) * camera.scale,
    isActiveDomain: node.category === activeDomain,
    isHighlighted: node.id === highlightNodeId,
    isLit: litNodeIds.includes(node.id),
  }));

  // 保持 ref 给粒子系统用
  const transformedNodesRef = useRef(transformedNodes);
  transformedNodesRef.current = transformedNodes;

  // Canvas 粒子渲染循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current
        .map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vx: p.vx * 0.96,
          vy: p.vy * 0.96,
          life: p.life + 1,
        }))
        .filter((p) => p.life < p.maxLife);

      particlesRef.current.forEach((p) => {
        const alpha = 1 - p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${alpha * 0.85})`;
        ctx.fill();
        // 光晕
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${alpha * 0.15})`;
        ctx.fill();
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [dimensions]);

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
          <filter id="highlight-glow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {links.map((link) => {
          const source = findNode(link.source);
          const target = findNode(link.target);
          if (!source || !target) return null;
          return (
            <g key={`${link.source}-${link.target}`}>
              <line
                x1={source.screenX} y1={source.screenY}
                x2={target.screenX} y2={target.screenY}
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
          const isHovered = hoveredNode === node.id;
          const isHL = node.isHighlighted;
          return (
            <g
              key={node.id}
              style={{ cursor: node.slug ? "pointer" : "default" }}
              onClick={() => node.slug && router.push(`/notes/${node.slug}`)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              filter={isHL ? "url(#highlight-glow)" : undefined}
            >
              {/* 外发光圈 */}
              <circle cx={node.screenX} cy={node.screenY} r={node.radius * 2.2} fill={style.glow} opacity={opacity}>
                {(node.status === "completed" || node.isLit) && (
                  <animate attributeName="r" values={`${node.radius * 1.9};${node.radius * 2.6};${node.radius * 1.9}`} dur="2.2s" repeatCount="indefinite" />
                )}
                <animate attributeName="opacity" values={`${opacity * 0.25};${opacity * 0.6};${opacity * 0.25}`} dur="3s" repeatCount="indefinite" />
              </circle>
              {/* 搜索高亮环 */}
              {isHL && (
                <circle
                  cx={node.screenX} cy={node.screenY} r={node.radius * 3}
                  fill="none" stroke="rgba(0,229,255,0.6)" strokeWidth={2}
                >
                  <animate attributeName="r" values={`${node.radius * 2};${node.radius * 3.5};${node.radius * 2}`} dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              {/* 实心节点 */}
              <circle
                cx={node.screenX} cy={node.screenY}
                r={isHovered ? node.radius * 1.3 : node.radius}
                fill={node.isLit ? "rgba(0,229,255,0.95)" : style.fill}
                opacity={opacity}
                stroke={isHL ? "rgba(0,229,255,0.8)" : node.isActiveDomain ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0)"}
                strokeWidth={isHL ? 2 : node.isActiveDomain ? 1 : 0}
                style={{ transition: "r 0.2s ease, fill 0.3s ease" }}
              />
              {/* 节点名称 */}
              <text
                x={node.screenX + node.radius + 8}
                y={node.screenY + 4}
                fill={isHL ? "rgba(0,229,255,1)" : node.isActiveDomain ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.35)"}
                fontSize={node.depth === 0 ? 15 : isHL ? 13 : 11}
                fontWeight={isHL ? 600 : 400}
                className="select-none"
              >
                {node.title}
              </text>
              {/* 悬停提示文字 */}
              {isHovered && node.description && (
                <foreignObject
                  x={node.screenX + node.radius + 6}
                  y={node.screenY + 10}
                  width={200}
                  height={60}
                >
                  <div className="rounded-lg border border-white/10 bg-[#0a0f1d]/90 px-2.5 py-1.5 backdrop-blur-sm">
                    <p className="text-[10px] leading-4 text-white/55">{node.description}</p>
                  </div>
                </foreignObject>
              )}
            </g>
          );
        })}
      </svg>

      {/* 粒子 Canvas 叠加层 */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        width={dimensions.width}
        height={dimensions.height}
      />

      <motion.div
        className="absolute left-5 top-5 rounded-2xl border border-cyan-400/15 bg-slate-950/40 px-4 py-3 backdrop-blur-md"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-300/70">Knowledge Constellation</p>
        <h3 className="mt-2 text-lg font-semibold text-white/90">{domainMeta[activeDomain].label} 星域</h3>
        <p className="mt-1 max-w-sm text-xs text-white/45">{domainMeta[activeDomain].description}</p>
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/45 to-transparent" />
    </div>
  );
}
