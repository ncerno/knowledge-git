"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, Anchor, Bot } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.reply || data.error || "..." }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "🌊 信号中断，请稍后再试。" }]);
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading]);

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-[10px] border border-white/[0.08] bg-[rgba(8,14,26,0.85)] shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl transition duration-200 hover:border-cyan-400/14 hover:bg-[rgba(10,18,32,0.92)]"
          >
            <MessageCircle size={18} className="text-cyan-300/80" />
            <span className="absolute -right-0.5 top-0.5 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.5)]" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            className="fixed bottom-5 right-5 z-50 flex h-[min(78vh,620px)] w-[calc(100vw-24px)] max-w-[410px] flex-col overflow-hidden rounded-[14px] border border-white/[0.08] bg-[rgba(8,14,26,0.94)] shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-2xl"
          >
            <div className="border-b border-white/[0.08] px-4 py-4 sm:px-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-cyan-400/12 bg-cyan-400/[0.05]">
                    <Anchor size={16} className="text-cyan-300/82" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/82">守岸人</p>
                    <p className="mt-0.5 font-mono text-[10px] tracking-[0.08em] text-white/30">AI Assistant · Online</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="rounded-[8px] border border-white/[0.07] bg-white/[0.03] p-2 text-white/34 transition hover:text-white/72">
                  <X size={16} />
                </button>
              </div>
              <p className="mt-2.5 text-xs leading-5 text-white/45">向守岸人提问学习路径、节点理解或笔记整理方向。</p>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
              {messages.length === 0 && (
                <div className="flex h-full flex-col justify-center rounded-[10px] border border-dashed border-white/[0.07] bg-white/[0.02] px-5 py-8 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[8px] border border-cyan-400/12 bg-cyan-400/[0.05]">
                    <Sparkles size={20} className="text-cyan-300/68" />
                  </div>
                  <p className="mt-4 text-sm text-white/65">你好，我是守岸人。</p>
                  <p className="mt-2 text-xs leading-6 text-white/40">从技术问题到学习航线，我会在这片黑海岸为你保持信号通畅。</p>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex max-w-[88%] gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] border ${msg.role === "user" ? "border-cyan-400/14 bg-cyan-400/[0.06]" : "border-white/[0.07] bg-white/[0.03]"}`}>
                      {msg.role === "user" ? <MessageCircle size={13} className="text-cyan-200/90" /> : <Bot size={13} className="text-white/62" />}
                    </div>
                    <div className={`rounded-[10px] px-3.5 py-2.5 text-xs leading-6 ${msg.role === "user" ? "rounded-br-sm border border-cyan-400/14 bg-cyan-400/[0.08] text-cyan-50/90" : "rounded-bl-sm border border-white/[0.07] bg-white/[0.035] text-white/72"}`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 px-1 text-white/36">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300/45" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                  <span className="text-[11px]">守岸人正在整理回应…</span>
                </div>
              )}
            </div>

            <div className="border-t border-white/[0.08] px-4 py-3 sm:px-5 sm:py-4">
              <div className="rounded-[10px] border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 transition focus-within:border-cyan-400/14 focus-within:bg-white/[0.04]">
                <div className="flex items-end gap-3">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                    placeholder="向守岸人提问..."
                    className="flex-1 bg-transparent text-sm text-white/82 placeholder-white/28 outline-none"
                    disabled={loading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-cyan-400/14 bg-cyan-400/[0.06] text-cyan-200/75 transition duration-200 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <Send size={15} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

