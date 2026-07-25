"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { Plus, Trash, Check, Zap } from "lucide-react";
import { clsx } from "clsx";

export default function DailyUpdatePage() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [planned, setPlanned] = useState<string[]>([]);
  const [newCompleted, setNewCompleted] = useState("");
  const [newPlanned, setNewPlanned] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [myScore, setMyScore] = useState<any>({ totalAllTime: 0, thisMonth: 0 });
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    // Load point summary and daily standup history
    api.points.myScore().then(setMyScore).catch(console.error);
    api.dailyUpdates.myHistory().then(setHistory).catch(console.error);
  }, []);

  const addCompleted = () => {
    if (newCompleted.trim()) {
      setCompleted([...completed, newCompleted.trim()]);
      setNewCompleted("");
    }
  };

  const addPlanned = () => {
    if (newPlanned.trim()) {
      setPlanned([...planned, newPlanned.trim()]);
      setNewPlanned("");
    }
  };

  const removeCompleted = (idx: number) => {
    setCompleted(completed.filter((_, i) => i !== idx));
  };

  const removePlanned = (idx: number) => {
    setPlanned(planned.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (completed.length === 0 || planned.length === 0) return;

    setLoading(true);
    setSuccess(false);
    try {
      await api.dailyUpdates.submit({ completedItems: completed, plannedItems: planned });
      setSuccess(true);
      setCompleted([]);
      setPlanned([]);
      // Refresh statistics and history list
      const score = await api.points.myScore();
      setMyScore(score);
      const updates = await api.dailyUpdates.myHistory();
      setHistory(updates);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Daily Standup Update</h1>
          <p className="text-sm text-muted mt-0.5">Submit your daily update to keep the team aligned and earn points.</p>
        </div>
        <div className="flex items-center gap-2 card p-2 px-3 shadow-sm border border-indigo-100 bg-indigo-50/50">
          <Zap size={14} className="text-indigo-500 fill-indigo-500" />
          <span className="text-xs font-bold text-indigo-950">Month Score: {myScore.thisMonth} pts</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <div className="card p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Completed */}
              <div>
                <label className="form-label text-sm font-semibold">Today I Completed</label>
                <p className="text-xs text-muted mb-2 font-medium">What tasks did you complete today? Press Enter or Click Plus to add.</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCompleted}
                    onChange={(e) => setNewCompleted(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCompleted())}
                    placeholder="e.g. Implemented auth middleware endpoints"
                    className="form-input"
                  />
                  <button type="button" onClick={addCompleted} className="btn btn-secondary">
                    <Plus size={16} />
                  </button>
                </div>

                <div className="space-y-2 mt-3">
                  {completed.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-surface p-2.5 rounded-lg border border-border">
                      <span className="text-xs font-medium text-ink">{item}</span>
                      <button type="button" onClick={() => removeCompleted(idx)} className="text-danger hover:bg-danger-light p-1 rounded">
                        <Trash size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Planned */}
              <div>
                <label className="form-label text-sm font-semibold">Tomorrow I Will Work On</label>
                <p className="text-xs text-muted mb-2 font-medium">What is your core focus for the next work day?</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPlanned}
                    onChange={(e) => setNewPlanned(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPlanned())}
                    placeholder="e.g. Wire CRM frontend pipeline view"
                    className="form-input"
                  />
                  <button type="button" onClick={addPlanned} className="btn btn-secondary">
                    <Plus size={16} />
                  </button>
                </div>

                <div className="space-y-2 mt-3">
                  {planned.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-surface p-2.5 rounded-lg border border-border">
                      <span className="text-xs font-medium text-ink">{item}</span>
                      <button type="button" onClick={() => removePlanned(idx)} className="text-danger hover:bg-danger-light p-1 rounded">
                        <Trash size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {success && (
                <div className="flex items-center gap-2 bg-success-light text-success border border-success/20 p-3 rounded-lg">
                  <Check size={16} />
                  <p className="text-xs font-semibold">Daily standup submitted successfully! +1 Point awarded.</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || completed.length === 0 || planned.length === 0}
                className="btn btn-primary w-full justify-center"
              >
                {loading ? "Submitting..." : "Submit Standup"}
              </button>
            </form>
          </div>

          {/* History */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink mb-4">Past Updates</h3>
            <div className="space-y-4">
              {history.map((up) => (
                <div key={up.id} className="p-4 rounded-lg border border-border bg-white space-y-2">
                  <span className="text-[10px] font-bold text-muted uppercase">Update for {new Date(up.date).toLocaleDateString()}</span>
                  <div>
                    <p className="text-[11px] font-bold text-ink">Completed:</p>
                    <ul className="list-disc pl-4 text-xs text-muted">
                      {up.completedItems.map((item: string, i: number) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-ink">Planned:</p>
                    <ul className="list-disc pl-4 text-xs text-muted">
                      {up.plannedItems.map((item: string, i: number) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
              {history.length === 0 && <p className="text-xs text-muted">No updates submitted yet.</p>}
            </div>
          </div>
        </div>

        {/* Sidebar Point Guide */}
        <div className="space-y-5">
          <div className="card p-5 border-t-4 border-indigo-500">
            <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-1.5">
              <Zap size={15} className="text-indigo-500 fill-indigo-500" />
              Points Allocation
            </h3>
            <div className="space-y-2">
              {[
                { name: "Standup Submitted", score: "+1" },
                { name: "Missed standup update", score: "-5" },
                { name: "Task completed", score: "+10" },
                { name: "Completed early", score: "+5" },
                { name: "Late task delivery", score: "-3" },
                { name: "Review approved", score: "+5" },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <span className="text-muted">{item.name}</span>
                  <span className={clsx("font-bold", item.score.startsWith("+") ? "text-success" : "text-danger")}>
                    {item.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
