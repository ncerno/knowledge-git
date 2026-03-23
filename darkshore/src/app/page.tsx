 "use client";
 
 import { motion } from "framer-motion";
 import { BookOpen, Star, Zap, Clock, TrendingUp, Layers, ChevronRight, Radio } from "lucide-react";
 import GlassCard from "@/components/GlassCard";
 import DataWave from "@/components/DataWave";
 
 const STATS = [
   { icon: BookOpen, label: "知识笔记", value: "0", unit: "篇", color: "text-cyan-400",   glow: "rgba(0,229,255,0.3)" },
   { icon: Star,     label: "掌握技能", value: "0", unit: "项", color: "text-blue-400",   glow: "rgba(59,130,246,0.3)" },
   { icon: Zap,      label: "学习连击", value: "0", unit: "天", color: "text-violet-400", glow: "rgba(139,92,246,0.3)" },
   { icon: Clock,    label: "专注时长", value: "0", unit: "h",  color: "text-emerald-400",glow: "rgba(52,211,153,0.3)" },
 ];
 
 const MODULES = [
   { title: "Roadmap 路径", desc: "规划你的技术成长轨迹",   icon: TrendingUp, status: "即将开放", tag: "PHASE 2" },
   { title: "知识星图",     desc: "连接知识节点的可视化图谱", icon: Layers,    status: "即将开放", tag: "PHASE 3" },
   { title: "全文检索",     desc: "跨文档的智能语义搜索",    icon: Radio,     status: "即将开放", tag: "PHASE 2" },
 ];
 
 const containerVariants = {
   hidden: {},
   show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
 };
 const itemVariants = {
   hidden: { opacity: 0, y: 20 },
   show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
 };
 
 export default function HomePage() {
   return (
     <div className="min-h-full p-6 md:p-8">
       <motion.div
         className="max-w-5xl mx-auto flex flex-col gap-8"
         variants={containerVariants}
         initial="hidden"
         animate="show"
       >
         {/* 顶部标题 */}
         <motion.div variants={itemVariants} className="flex items-end justify-between">
           <div>
             <p className="text-[10px] font-mono text-cyan-400/60 tracking-[0.25em] uppercase mb-1">
               // DARKSHORE · SYSTEM ONLINE
             </p>
             <h1 className="text-2xl md:text-3xl font-bold text-white/90 leading-tight">
               守望台
               <span className="ml-3 text-sm font-normal text-white/35 font-mono">Dashboard</span>
             </h1>
             <p className="text-sm text-white/40 mt-1">以知识为灯塔，以星图为路径</p>
           </div>
           <DataWave bars={6} height="h-10" color="cyan" label="SIGNAL ACTIVE" />
         </motion.div>
 
         {/* 系统状态栏 */}
         <motion.div variants={itemVariants}>
           <GlassCard accentBar padding="px-4 py-3" className="flex items-center gap-3">
             <motion.div
               className="w-2 h-2 rounded-full bg-cyan-400"
               animate={{ opacity: [1, 0.2, 1], scale: [1, 0.8, 1] }}
               transition={{ duration: 2, repeat: Infinity }}
             />
             <p className="text-xs font-mono text-white/50 tracking-wider">
               SYSTEM STATUS <span className="text-cyan-400">NOMINAL</span>
               <span className="mx-3 text-white/20">|</span>
               BACKEND <span className="text-emerald-400">CONNECTED</span>
               <span className="mx-3 text-white/20">|</span>
               DATABASE <span className="text-emerald-400">READY</span>
             </p>
           </GlassCard>
         </motion.div>
 
         {/* 四项统计卡片 */}
         <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3">
           {STATS.map(({ icon: Icon, label, value, unit, color, glow }) => (
             <GlassCard key={label} accentBar glowOnHover padding="p-4">
               <div className="flex items-center gap-2 mb-3">
                 <div
                   className="w-7 h-7 rounded-lg flex items-center justify-center"
                   style={{ background: `${glow.replace("0.3", "0.12")}`, border: `1px solid ${glow}` }}
                 >
                   <Icon size={13} className={color} />
                 </div>
                 <p className="text-[10px] text-white/40 font-medium tracking-wide">{label}</p>
               </div>
               <div className="flex items-baseline gap-1">
                 <span className={`text-2xl font-bold ${color}`} style={{ textShadow: `0 0 16px ${glow}` }}>
                   {value}
                 </span>
                 <span className="text-xs text-white/30">{unit}</span>
               </div>
             </GlassCard>
           ))}
         </motion.div>
 
         {/* 功能模块预览 */}
         <motion.div variants={itemVariants}>
           <div className="flex items-center gap-2 mb-3">
             <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(0,229,255,0.3), transparent)" }} />
             <p className="text-[10px] font-mono text-white/30 tracking-[0.2em] uppercase px-2">功能模块</p>
             <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.3))" }} />
           </div>
           <div className="flex flex-col gap-3">
             {MODULES.map(({ title, desc, icon: Icon, status, tag }) => (
               <GlassCard key={title} glowOnHover padding="p-4">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                       style={{ background: "rgba(0,229,255,0.07)", border: "1px solid rgba(0,229,255,0.15)" }}>
                       <Icon size={15} className="text-cyan-400/70" />
                     </div>
                     <div>
                       <p className="text-sm font-semibold text-white/80">{title}</p>
                       <p className="text-[11px] text-white/35 mt-0.5">{desc}</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className="text-[9px] font-mono text-cyan-400/50 border border-cyan-400/20 rounded px-1.5 py-0.5 tracking-wider">
                       {tag}
                     </span>
                     <span className="text-[10px] text-white/25">{status}</span>
                     <ChevronRight size={13} className="text-white/20" />
                   </div>
                 </div>
               </GlassCard>
             ))}
           </div>
         </motion.div>
 
         {/* 底部签名 */}
         <motion.div variants={itemVariants} className="flex justify-center pb-2">
           <p className="text-[9px] font-mono text-white/15 tracking-[0.3em] uppercase">
             DARK SHORE · SHOREKEEPER · PHASE I INITIALIZED
           </p>
         </motion.div>
       </motion.div>
     </div>
   );
 }
