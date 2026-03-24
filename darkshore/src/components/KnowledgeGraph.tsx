"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { initialRoadmaps, domainMeta, type NodeCategory } from "@/lib/data/initialRoadmaps";

interface Props {
  activeDomain: NodeCategory;
  highlightNodeId?: string | null;
  litNodeIds?: string[];
  notedNodeIds?: string[];
}

const ST = {
  locked:    { fill: "rgba(100,116,139,0.45)", glow: "rgba(100,116,139,0.12)" },
  available: { fill: "rgba(255,255,255,0.8)",  glow: "rgba(255,255,255,0.15)" },
  completed: { fill: "rgba(34,211,238,0.95)",  glow: "rgba(34,211,238,0.4)" },
  noted:     { fill: "rgba(0,229,255,0.95)",   glow: "rgba(0,229,255,0.45)" },
} as const;

export default function KnowledgeGraph({ activeDomain, highlightNodeId, litNodeIds = [], notedNodeIds = [] }: Props) {
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);
  const canRef = useRef<HTMLCanvasElement>(null);
  type P = { x:number;y:number;vx:number;vy:number;life:number;mx:number;sz:number;c:string };
  const pRef = useRef<P[]>([]);
  const raf = useRef(0);
  const [dims, setDims] = useState({ w: 1200, h: 800 });
  const [hov, setHov] = useState<string|null>(null);
  const [cam, setCam] = useState({ x: 0, y: 0, s: 1 });
  const drg = useRef(false);
  const ds = useRef({ x:0,y:0,cx:0,cy:0 });
  const noted = useMemo(() => new Set(notedNodeIds), [notedNodeIds]);

  const { nodes, links } = useMemo(() => {
    const m = initialRoadmaps.map(n => {
      const c = domainMeta[n.category].center;
      return { ...n, x: c.x+n.posX*240, y: c.y+n.posY*180 };
    });
    return { nodes: m, links: m.filter(n=>n.prerequisiteId).map(n=>({ s: n.prerequisiteId!, t: n.id })) };
  }, []);

  useEffect(() => {
    const fn = () => { const r = boxRef.current?.getBoundingClientRect(); if(r) setDims({ w:r.width, h:r.height }); };
    fn(); window.addEventListener("resize",fn); return ()=>window.removeEventListener("resize",fn);
  }, []);
  useEffect(() => { const t=domainMeta[activeDomain].center; setCam(p=>({...p,x:-t.x,y:-t.y,s:1.15})); }, [activeDomain]);
  useEffect(() => { if(!highlightNodeId) return; const n=nodes.find(nd=>nd.id===highlightNodeId); if(n) setCam({x:-n.x,y:-n.y,s:1.4}); }, [highlightNodeId,nodes]);

  const onPD = useCallback((e:React.PointerEvent) => {
    if((e.target as HTMLElement).closest("[data-node]")) return;
    drg.current=true; ds.current={x:e.clientX,y:e.clientY,cx:cam.x,cy:cam.y};
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [cam.x,cam.y]);
  const onPM = useCallback((e:React.PointerEvent) => {
    if(!drg.current) return;
    setCam(p=>({...p,x:ds.current.cx+(e.clientX-ds.current.x)/cam.s,y:ds.current.cy+(e.clientY-ds.current.y)/cam.s}));
  }, [cam.s]);
  const onPU = useCallback(()=>{drg.current=false;}, []);
  const onWh = useCallback((e:React.WheelEvent) => {
    e.preventDefault(); setCam(p=>({...p,s:Math.max(0.35,Math.min(3,p.s*(1-e.deltaY*0.001)))}));
  }, []);

  const spawn = useCallback((cx:number,cy:number)=>{
    for(let i=0;i<24;i++){const a=(Math.PI*2*i)/24+(Math.random()-0.5)*0.5,sp=1.5+Math.random()*3;
    pRef.current.push({x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1,mx:35+Math.random()*25,sz:2+Math.random()*2.5,c:Math.random()>0.5?"0,229,255":"34,211,238"});}
  },[]);

  const tn = useMemo(() => nodes.map(n=>({
    ...n, sx:dims.w/2+(n.x+cam.x)*cam.s, sy:dims.h/2+(n.y+cam.y)*cam.s,
    r:(n.depth===0?12:5+n.weight*2.8)*cam.s,
    act:n.category===activeDomain, hl:n.id===highlightNodeId, lit:litNodeIds.includes(n.id), hasN:noted.has(n.id),
  })),[nodes,dims,cam,activeDomain,highlightNodeId,litNodeIds,noted]);
  const tnR=useRef(tn); tnR.current=tn;

  useEffect(()=>{if(!litNodeIds.length)return;litNodeIds.forEach(id=>{const nd=tnR.current.find(n=>n.id===id);if(nd)spawn(nd.sx,nd.sy);});},[litNodeIds,spawn]);

  useEffect(()=>{
    const c=canRef.current;if(!c)return;const ctx=c.getContext("2d");if(!ctx)return;
    const lp=()=>{c.width=dims.w;c.height=dims.h;ctx.clearRect(0,0,dims.w,dims.h);
    pRef.current=pRef.current.map(p=>({...p,x:p.x+p.vx,y:p.y+p.vy,vx:p.vx*0.96,vy:p.vy*0.96,life:p.life+1})).filter(p=>p.life<p.mx);
    pRef.current.forEach(p=>{const a=1-p.life/p.mx;ctx.beginPath();ctx.arc(p.x,p.y,p.sz*a,0,Math.PI*2);ctx.fillStyle=`rgba(${p.c},${a*0.8})`;ctx.fill();
    ctx.beginPath();ctx.arc(p.x,p.y,p.sz*a*3,0,Math.PI*2);ctx.fillStyle=`rgba(${p.c},${a*0.1})`;ctx.fill();});
    raf.current=requestAnimationFrame(lp);};raf.current=requestAnimationFrame(lp);return()=>cancelAnimationFrame(raf.current);
  },[dims]);

  const fd=(id:string)=>tn.find(n=>n.id===id);
  const gs=(n:typeof tn[0])=>n.hasN||n.lit?ST.noted:ST[n.status as keyof typeof ST]||ST.locked;

  return (
    <div ref={boxRef} className="relative h-full w-full cursor-grab overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.01] active:cursor-grabbing"
      onPointerDown={onPD} onPointerMove={onPM} onPointerUp={onPU} onWheel={onWh} style={{touchAction:"none"}}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,229,255,0.05),transparent_60%)]"/>
      <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${dims.w} ${dims.h}`}>
        <defs>
          <linearGradient id="sl" x1="0%" y1="0%" x2="100%"><stop offset="0%" stopColor="rgba(34,211,238,0.04)"/><stop offset="50%" stopColor="rgba(34,211,238,0.5)"/><stop offset="100%" stopColor="rgba(96,165,250,0.06)"/></linearGradient>
          <filter id="hlg"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {links.map(l=>{const a=fd(l.s),b=fd(l.t);if(!a||!b)return null;const ac=a.act||b.act;
        return <line key={l.s+l.t} x1={a.sx} y1={a.sy} x2={b.sx} y2={b.sy} stroke="url(#sl)" strokeOpacity={ac?0.85:0.25} strokeWidth={ac?1.5:0.8} strokeDasharray="7 10">
          <animate attributeName="stroke-dashoffset" from="34" to="0" dur="2.4s" repeatCount="indefinite"/></line>;})}
        {tn.map(n=>{const s=gs(n);const op=n.act?1:0.35;const ih=hov===n.id;
        return <g key={n.id} data-node style={{cursor:n.slug?"pointer":"default"}}
          onClick={()=>n.slug&&router.push(`/notes/${n.slug}`)} onMouseEnter={()=>setHov(n.id)} onMouseLeave={()=>setHov(null)}
          filter={n.hl?"url(#hlg)":undefined}>
          <circle cx={n.sx} cy={n.sy} r={n.r*2.2} fill={s.glow} opacity={op}>
            {(n.hasN||n.lit)&&<animate attributeName="r" values={`${n.r*1.8};${n.r*2.6};${n.r*1.8}`} dur="2s" repeatCount="indefinite"/>}
            <animate attributeName="opacity" values={`${op*0.2};${op*0.55};${op*0.2}`} dur="3s" repeatCount="indefinite"/></circle>
          {n.hl&&<circle cx={n.sx} cy={n.sy} r={n.r*3} fill="none" stroke="rgba(0,229,255,0.6)" strokeWidth={2}>
            <animate attributeName="r" values={`${n.r*2};${n.r*3.5};${n.r*2}`} dur="1.5s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite"/></circle>}
          <circle cx={n.sx} cy={n.sy} r={ih?n.r*1.3:n.r} fill={s.fill} opacity={op}
            stroke={n.hl?"rgba(0,229,255,0.8)":n.act?"rgba(255,255,255,0.4)":"none"} strokeWidth={n.hl?2:n.act?1:0}
            style={{transition:"r 0.2s ease,fill 0.3s ease"}}/>
          <text x={n.sx+n.r+8} y={n.sy+4}
            fill={n.hasN?"rgba(0,229,255,1)":n.hl?"rgba(0,229,255,1)":n.act?"rgba(255,255,255,0.88)":"rgba(255,255,255,0.3)"}
            fontSize={n.depth===0?15:n.hl?13:12} fontWeight={n.hasN||n.hl?600:400} className="select-none">{n.title}</text>
          {ih&&n.description&&<foreignObject x={n.sx+n.r+6} y={n.sy+10} width={200} height={60}>
            <div className="rounded-xl border border-white/8 bg-[#0a0f1d]/90 px-2.5 py-1.5 backdrop-blur-sm">
              <p className="text-[10px] leading-4 text-white/50">{n.description}</p></div></foreignObject>}
        </g>;})}
      </svg>
      <canvas ref={canRef} className="pointer-events-none absolute inset-0 h-full w-full" width={dims.w} height={dims.h}/>
      <motion.div className="absolute left-5 top-5 rounded-2xl border border-cyan-400/10 bg-slate-950/50 px-5 py-3.5 backdrop-blur-lg"
        initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}>
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cyan-300/55">Knowledge Constellation</p>
        <h3 className="mt-2 text-lg font-semibold text-white/90">{domainMeta[activeDomain].label} <span className="text-sm font-normal text-white/40">星域</span></h3>
        <p className="mt-1 max-w-xs text-[12px] leading-5 text-white/40">{domainMeta[activeDomain].description}</p>
      </motion.div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0a0f1d]/50 to-transparent"/>
      <div className="absolute bottom-4 right-4 flex gap-1.5">
        <button onClick={()=>setCam(p=>({...p,s:Math.min(3,p.s*1.2)}))} className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05] text-[13px] text-white/40 hover:bg-white/[0.1] hover:text-white/70 backdrop-blur-sm">+</button>
        <button onClick={()=>setCam(p=>({...p,s:Math.max(0.35,p.s/1.2)}))} className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05] text-[13px] text-white/40 hover:bg-white/[0.1] hover:text-white/70 backdrop-blur-sm">−</button>
      </div>
    </div>
  );
}

