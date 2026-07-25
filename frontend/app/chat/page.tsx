"use client";

import { useState, useEffect, useRef } from "react";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { Send, Plus, Users } from "lucide-react";
import { clsx } from "clsx";

export default function ChatPage() {
  const [channels, setChannels] = useState<any[]>([]);
  const [activeChannel, setActiveChannel] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [me, setMe] = useState<any>(null);
  const [showDirectModal, setShowDirectModal] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    try {
      const [chanList, eList, user] = await Promise.all([
        api.chat.channels.list(),
        api.employees.list(),
        api.me(),
      ]);
      setChannels(chanList);
      setEmployees(eList.filter((emp) => emp.id !== user.id));
      setMe(user);

      if (chanList.length > 0 && !activeChannel) {
        setActiveChannel(chanList[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadMessages = async () => {
    if (!activeChannel) return;
    try {
      const msgList = await api.chat.channels.messages(activeChannel.id);
      // Reverse messages because they are returned desc in REST usually
      setMessages(msgList.reverse());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000); // Poll messages every 5s for simple real-time
    return () => clearInterval(interval);
  }, [activeChannel]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeChannel || !me) return;
    const bodyText = input.trim();
    setInput("");

    // Optimistic UI update
    const tempMsg = {
      id: "temp-" + Date.now(),
      body: bodyText,
      sender: { fullName: me.fullName, id: me.id },
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await api.chat.channels.sendMessage(activeChannel.id, bodyText);
      loadMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const startDirectMessage = async (targetUserId: string) => {
    try {
      const channel = await api.chat.channels.createDirect(targetUserId);
      const updatedChans = await api.chat.channels.list();
      setChannels(updatedChans);
      setActiveChannel(channel);
      setShowDirectModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink font-display">Company Chat</h1>
          <p className="text-sm text-muted mt-0.5">Real-time collaboration across departments and direct messages.</p>
        </div>
        <button onClick={() => setShowDirectModal(true)} className="btn btn-primary gap-1.5 btn-sm">
          <Plus size={14} /> Direct Message
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4 h-[550px] items-stretch">
        {/* Channels sidebar */}
        <div className="card p-4 space-y-2 overflow-y-auto bg-white border border-border">
          <span className="text-[10px] text-muted font-bold tracking-wide uppercase">Channels & DMs</span>
          {channels.map((chan) => (
            <div
              key={chan.id}
              onClick={() => setActiveChannel(chan)}
              className={clsx(
                "p-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors",
                activeChannel?.id === chan.id ? "bg-accent/10 text-accent border border-accent/10" : "text-muted hover:text-ink hover:bg-surface"
              )}
            >
              # {chan.name.startsWith("dm:") ? "DM Thread" : chan.name}
            </div>
          ))}
          {channels.length === 0 && <p className="text-[10px] text-muted">No channels active.</p>}
        </div>

        {/* Message board */}
        <div className="card flex flex-col p-4 bg-white border border-border">
          <div className="flex-1 space-y-4 overflow-y-auto pb-4">
            {messages.map((m, i) => (
              <div key={m.id || i} className="flex gap-2">
                <div className="avatar avatar-sm w-7 h-7 bg-slate-100 text-slate-800 text-[10px]">
                  {m.sender?.fullName?.[0] ?? "U"}
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-xs font-semibold text-ink">{m.sender?.fullName ?? "You"}</p>
                    <span className="text-[9px] text-muted">{m.createdAt ? new Date(m.createdAt).toLocaleTimeString() : ""}</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed mt-0.5">{m.body}</p>
                </div>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>

          <div className="flex gap-2 border-t border-slate-100 pt-4">
            <input
              type="text"
              value={input}
              placeholder={activeChannel ? `Message # ${activeChannel.name.startsWith("dm:") ? "DM" : activeChannel.name}...` : "Select a channel"}
              disabled={!activeChannel}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="form-input flex-1"
            />
            <button onClick={handleSend} disabled={!activeChannel} className="btn btn-primary"><Send size={14} /></button>
          </div>
        </div>
      </div>

      {/* Direct Message modal */}
      {showDirectModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6 bg-white space-y-4">
            <h3 className="font-semibold text-base text-ink">New Direct Message</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {employees.map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => startDirectMessage(emp.id)}
                  className="flex items-center gap-3 p-2 rounded-lg border border-border cursor-pointer hover:bg-surface transition-colors"
                >
                  <div className="avatar avatar-sm">{emp.fullName[0]}</div>
                  <div>
                    <p className="text-xs font-bold text-ink">{emp.fullName}</p>
                    <p className="text-[10px] text-muted">{emp.role?.name}</p>
                  </div>
                </div>
              ))}
              {employees.length === 0 && <p className="text-xs text-muted">No other team members found.</p>}
            </div>
            <div className="flex justify-end">
              <button onClick={() => setShowDirectModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
