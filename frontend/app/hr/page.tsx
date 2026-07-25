"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { Calendar, Plus, Check, Ban } from "lucide-react";
import { clsx } from "clsx";

export default function HrPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [balance, setBalance] = useState<any>({ sick: 0, casual: 0, earned: 0 });
  const [me, setMe] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [type, setType] = useState("CASUAL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const loadData = async () => {
    try {
      const [leaveList, holidayList, bal, user] = await Promise.all([
        api.hr.leaves.list(),
        api.hr.holidays().catch(() => []),
        api.hr.leaveBalance().catch(() => ({ sick: 10, casual: 12, earned: 15 })),
        api.me(),
      ]);
      setLeaves(leaveList);
      setHolidays(holidayList);
      setBalance(bal);
      setMe(user);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    setLoading(true);
    try {
      await api.hr.leaves.create({
        type,
        startDate,
        endDate,
        reason,
      });
      setReason("");
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      await api.hr.leaves.approve(id, status);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const isHr = me && ["SUPER_ADMIN", "COMPANY_ADMIN", "HR_MANAGER"].includes(me.role?.name);

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink font-display">HR Workspace</h1>
          <p className="text-sm text-muted mt-0.5">Apply for leaves, view holiday lists, and complete performance check-ins.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary gap-1.5">
          <Plus size={14} />
          Request Leave
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {/* Leaves */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink mb-4">Leave Requests</h3>
            <div className="space-y-3">
              {leaves.map((l) => (
                <div key={l.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-white flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <Calendar size={14} className="text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        {l.user?.fullName ?? "My"} — {l.type?.toLowerCase()} leave
                      </p>
                      <p className="text-xs text-muted">
                        {new Date(l.startDate).toLocaleDateString()} to {new Date(l.endDate).toLocaleDateString()}
                        {l.reason ? ` · "${l.reason}"` : ""}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={clsx("badge", l.status === "APPROVED" ? "badge-green" : l.status === "REJECTED" ? "badge-red" : "badge-yellow")}>
                      {l.status?.toLowerCase()}
                    </span>
                    
                    {isHr && l.status === "PENDING" && (
                      <div className="flex gap-1">
                        <button onClick={() => handleApprove(l.id, "APPROVED")} className="btn btn-secondary btn-sm p-1 text-success">
                          <Check size={14} />
                        </button>
                        <button onClick={() => handleApprove(l.id, "REJECTED")} className="btn btn-secondary btn-sm p-1 text-danger">
                          <Ban size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {leaves.length === 0 && <p className="text-xs text-muted">No leave requests found.</p>}
            </div>
          </div>
        </div>

        {/* Holidays & Balances */}
        <div className="space-y-5">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink mb-3">Leave Balance</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="text-[10px] text-muted font-bold block uppercase">Casual</span>
                <span className="text-sm font-bold text-ink">{balance.casual || 0}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="text-[10px] text-muted font-bold block uppercase">Sick</span>
                <span className="text-sm font-bold text-ink">{balance.sick || 0}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="text-[10px] text-muted font-bold block uppercase">Earned</span>
                <span className="text-sm font-bold text-ink">{balance.earned || 0}</span>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink mb-4">Upcoming Holidays</h3>
            <div className="space-y-3">
              {holidays.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-ink">{h.name}</p>
                    <p className="text-muted text-[10px]">{new Date(h.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {holidays.length === 0 && <p className="text-xs text-muted">No upcoming holidays scheduled.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6 bg-white space-y-4">
            <h3 className="font-semibold text-base text-ink">Apply for Leave</h3>
            
            <form onSubmit={handleApply} className="space-y-3">
              <div>
                <label className="form-label text-xs font-semibold">Leave Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="form-input text-xs"
                >
                  <option value="CASUAL">Casual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="EARNED">Earned Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-xs font-semibold">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>

                <div>
                  <label className="form-label text-xs font-semibold">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="form-label text-xs font-semibold">Reason</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Family medical emergency"
                  className="form-input text-xs h-20"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" disabled={loading} className="btn btn-primary btn-sm">{loading ? "Submitting..." : "Apply"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
