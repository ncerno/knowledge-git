"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, Anchor } from "lucide-react";

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
      setMessages([...newMessages, { role: "assistant", content: "🌊 信号中断...请稍后再试。" }]);
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading]);

  return (
    <>
      {/* 悬浮触发按钮 */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-cyan-400/30 bg-[#0d1526]/90 shadow-[0_0_30px_rgba(0,229,255,0.15)] backdrop-blur-lg transition hover:border-cyan-400/50 hover:shadow-[0_0_40px_rgba(0,229,255,0.25)]"
          >
            <MessageCircle size={20} className="text-cyan-300" />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-400/80" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 对话面板 */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[380px] flex-col overflow-hidden rounded-2xl border border-cyan-400/15 bg-[#0a0f1d]/95 shadow-[0_0_80px_rgba(0,229,255,0.1)] backdrop-blur-xl"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
              <div className="flex items-center gap-2">
                <Anchor size={14} className="animate-pulse text-cyan-300/80" />
                <div>
                  <p className="text-xs font-medium text-white/80">守岸人的栖身之所</p>
                  <p className="text-[10px] text-white/30">Cognitive Interface · Online</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/30 transition hover:text-white/60">
                <X size={16} />
              </button>
            </div>

            {/* 消息区 */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <Sparkles size={24} className="text-cyan-300/40" />
                  <p className="text-xs text-white/30 leading-5">
                    你好，我是守岸人。<br />
                    关于学习路径、技术问题，或只是想聊聊——<br />
                    我都在这里。
                  </p>
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-5 ${
                      msg.role === "user"
                        ? "rounded-br-md bg-cyan-400/15 text-cyan-100/90"
                        : "rounded-bl-md border border-white/6 bg-white/[0.04] text-white/75"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex gap-1 px-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300/40"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 输入区 */}
            <div className="border-t border-white/8 p-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  placeholder="向守岸人提问..."
                  className="flex-1 bg-transparent text-xs text-white/80 placeholder-white/25 outline-none"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="shrink-0 text-cyan-300/50 transition hover:text-cyan-300 disabled:opacity-30"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

