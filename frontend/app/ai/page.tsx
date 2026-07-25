"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { Sparkles, Send } from "lucide-react";

export default function AiPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello! I am your OfficeOS AI assistant. I can summarize your daily updates, analyze project risk mitigations, or search company policies. What would you like to ask?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const query = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setInput("");
    setLoading(true);

    try {
      let answer = "";
      if (query.toLowerCase().includes("summarize") || query.toLowerCase().includes("standup")) {
        answer = await api.ai.summarizeDay();
      } else {
        answer = await api.ai.ask(query);
      }
      setMessages((prev) => [...prev, { role: "assistant", text: answer }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: "assistant", text: `Error processing AI query: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink font-display">AI Assistant</h1>
          <p className="text-sm text-muted mt-0.5">Use AI queries to search knowledge bases, summarize daily work lists, and verify metrics.</p>
        </div>
      </div>

      <div className="card max-w-4xl mx-auto flex flex-col h-[500px] p-4 bg-white border border-border">
        <div className="flex-1 space-y-4 overflow-y-auto pb-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 max-w-[80%] ${m.role === "user" ? "ml-auto flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${m.role === "user" ? "bg-accent text-white" : "bg-indigo-50 text-accent"}`}>
                <Sparkles size={14} />
              </div>
              <div className={`p-3 rounded-xl text-xs leading-relaxed ${m.role === "user" ? "bg-accent text-white" : "bg-surface border border-border text-ink"}`}>
                {m.role === "assistant" && <p className="font-bold mb-1 text-[10px] text-accent">OfficeOS AI</p>}
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-accent flex items-center justify-center flex-shrink-0 animate-pulse">
                <Sparkles size={14} />
              </div>
              <span className="text-xs text-muted mt-2">Thinking...</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t border-slate-100 pt-4">
          <input
            type="text"
            value={input}
            placeholder="Ask AI for 'summarize standup' or type a policy question..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="form-input flex-1"
          />
          <button onClick={handleSend} className="btn btn-primary"><Send size={14} /></button>
        </div>
      </div>
    </AppShell>
  );
}
