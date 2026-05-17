"use client";
import { useState, useRef, useEffect } from "react";
import { Bot, Send, Loader2, Trash2 } from "lucide-react";
import MarkdownMessage from "@/components/MarkdownMessage";

interface Message {
  role: "user" | "model";
  text: string;
}

const SUGGESTED_QUESTIONS = [
  "How do I photograph growth plates consistently?",
  "What does high algae coverage on an artificial reef mean?",
  "How can I tell if seagrass is healthy?",
  "What marine species indicate good water quality?",
  "How should I report underwater waste?",
];

export default function AdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const userMsg: Message = { role: "user", text: msg };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Request failed");
      }

      const data = await res.json();
      setMessages([...updated, { role: "model", text: data.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Bot className="text-violet-400" size={28} />
          <div>
            <h1 className="text-2xl font-bold">AI Marine Advisor</h1>
            <p className="text-xs text-slate-500">Powered by Gemini — answers need expert verification</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => { setMessages([]); setError(null); }}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Trash2 size={14} />
            Clear chat
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.length === 0 && !loading && (
          <div className="text-center py-12 space-y-6">
            <div className="text-6xl font-bold text-violet-400/30">AI</div>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Ask me about marine species identification, monitoring best practices,
              reef health indicators, or anything related to your underwater observations.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-xs px-3 py-2 rounded-lg border border-slate-700 text-slate-300 hover:border-violet-600 hover:text-violet-300 transition-colors text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-violet-600 text-white whitespace-pre-wrap"
                  : "bg-slate-800 text-slate-200 border border-slate-700"
              }`}
            >
              {msg.role === "model" ? <MarkdownMessage text={msg.text} /> : msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              Thinking...
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="bg-red-900/30 border border-red-800 rounded-xl px-4 py-2 text-xs text-red-300">
              {error}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-3 border-t border-slate-800">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask about marine species, monitoring tips, reef health..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-600 transition-colors"
          disabled={loading}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="px-4 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
