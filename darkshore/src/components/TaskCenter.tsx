"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CheckCircle2, Clock, Trash2, AlertTriangle, Timer } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: number;
  deadline?: string | null;
  relatedNodeId?: string | null;
  completedAt?: string | null;
}

interface TaskCenterProps {
  onTaskComplete?: (relatedNodeId: string) => void;
}

export default function TaskCenter({ onTaskComplete }: TaskCenterProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch {
      console.error("获取任务失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const addTask = async () => {
    if (!newTitle.trim()) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          deadline: newDeadline || null,
          priority: 0,
        }),
      });
      if (res.ok) {
        setNewTitle("");
        setNewDeadline("");
        setShowForm(false);
        fetchTasks();
      }
    } catch { console.error("添加任务失败"); }
  };

  const toggleComplete = async (task: Task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, status: newStatus }),
      });
      if (newStatus === "completed" && task.relatedNodeId) {
        onTaskComplete?.(task.relatedNodeId);
      }
      fetchTasks();
    } catch { console.error("更新任务失败"); }
  };

  const deleteTask = async (id: string) => {
    try {
      await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
      fetchTasks();
    } catch { console.error("删除任务失败"); }
  };

  const getCountdown = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff <= 0) return { text: "已超期", urgent: true };
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    if (days > 0) return { text: `${days}天${hours}h`, urgent: days <= 1 };
    return { text: `${hours}h${Math.floor((diff % 3600000) / 60000)}m`, urgent: true };
  };

  const pendingTasks = tasks.filter((t) => t.status !== "completed" && t.status !== "archived");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  return (
    <div className="flex flex-col gap-3">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-300/65">
          <Timer size={12} /> 守望清单
          {pendingTasks.length > 0 && (
            <span className="rounded-full bg-cyan-400/15 px-2 py-0.5 text-cyan-300">{pendingTasks.length}</span>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg p-1.5 text-white/40 transition hover:bg-white/[0.06] hover:text-cyan-300"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* 新建表单 */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 rounded-xl border border-white/8 bg-white/[0.03] p-3">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="新的守望目标..."
                className="w-full rounded-lg bg-white/[0.04] px-3 py-2 text-xs text-white/80 placeholder-white/25 outline-none"
                onKeyDown={(e) => e.key === "Enter" && addTask()}
              />
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="flex-1 rounded-lg bg-white/[0.04] px-3 py-1.5 text-[11px] text-white/60 outline-none"
                />
                <button
                  onClick={addTask}
                  className="rounded-lg bg-cyan-400/15 px-3 py-1.5 text-[11px] font-medium text-cyan-300 transition hover:bg-cyan-400/25"
                >
                  添加
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* 任务列表 */}
      {loading ? (
        <p className="py-4 text-center text-xs text-white/20">加载中...</p>
      ) : pendingTasks.length === 0 && completedTasks.length === 0 ? (
        <p className="py-6 text-center text-xs text-white/25">
          守望清单为空。添加你的第一个学习目标吧。
        </p>
      ) : (
        <div className="space-y-1.5">
          {pendingTasks.map((task) => {
            const countdown = task.deadline ? getCountdown(task.deadline) : null;
            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="group flex items-start gap-2 rounded-xl border border-white/6 bg-white/[0.02] px-3 py-2.5 transition hover:border-white/10 hover:bg-white/[0.04]"
              >
                <button onClick={() => toggleComplete(task)} className="mt-0.5 shrink-0 text-white/25 transition hover:text-cyan-300">
                  <CheckCircle2 size={14} />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-white/75">{task.title}</p>
                  {countdown && (
                    <div className={`mt-1 flex items-center gap-1 text-[10px] ${countdown.urgent ? "text-amber-300/70" : "text-white/30"}`}>
                      {countdown.urgent ? <AlertTriangle size={10} /> : <Clock size={10} />}
                      {countdown.text}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="shrink-0 text-white/15 opacity-0 transition group-hover:opacity-100 hover:text-red-400/60"
                >
                  <Trash2 size={12} />
                </button>
              </motion.div>
            );
          })}

          {/* 已完成 */}
          {completedTasks.length > 0 && (
            <details className="mt-3">
              <summary className="cursor-pointer text-[10px] font-mono uppercase tracking-[0.2em] text-white/20 hover:text-white/40">
                已完成 ({completedTasks.length})
              </summary>
              <div className="mt-2 space-y-1">
                {completedTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center gap-2 rounded-lg px-3 py-1.5 opacity-50">
                    <CheckCircle2 size={12} className="text-emerald-300/60" />
                    <span className="truncate text-[11px] text-white/40 line-through">{task.title}</span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}