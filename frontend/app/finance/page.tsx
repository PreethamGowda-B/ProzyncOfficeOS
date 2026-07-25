"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { DollarSign, Plus, FileText } from "lucide-react";
import { clsx } from "clsx";

export default function FinancePage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ totalRevenue: 0, pendingAmount: 0, monthExpenses: 0 });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [clientId, setClientId] = useState(""); // Let's use leadId or general clientId
  const [projectId, setProjectId] = useState("");
  const [amount, setAmount] = useState(0);
  const [dueDate, setDueDate] = useState("");

  const loadData = async () => {
    try {
      const [invList, pList, sumData] = await Promise.all([
        api.finance.invoices.list(),
        api.projects.list(),
        api.finance.summary(),
      ]);
      setInvoices(invList);
      setProjects(pList);
      setSummary(sumData);
      if (pList.length > 0) {
        setProjectId(pList[0].id);
        setClientId(pList[0].clientId || "");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !projectId) return;

    setLoading(true);
    try {
      // Find the client linked to the project
      const selectedProj = projects.find((p) => p.id === projectId);
      const targetClientId = selectedProj?.clientId || clientId;

      await api.finance.invoices.create({
        clientId: targetClientId,
        projectId,
        amount: Number(amount),
        dueDate: dueDate || undefined,
      });

      setAmount(0);
      setDueDate("");
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (invId: string, newStatus: string) => {
    try {
      await api.finance.invoices.updateStatus(invId, newStatus);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink font-display">Finance Control</h1>
          <p className="text-sm text-muted mt-0.5">Track paid invoices, review ongoing expenses, and evaluate revenue metrics.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary gap-1.5">
          <Plus size={14} />
          Create Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-5 border-l-4 border-emerald-500">
          <span className="text-xs text-muted font-bold tracking-wide uppercase">Revenue Received</span>
          <p className="text-2xl font-display font-bold text-ink mt-2">
            INR {Number(summary.totalRevenue || 0).toLocaleString()}
          </p>
        </div>
        <div className="card p-5 border-l-4 border-indigo-500">
          <span className="text-xs text-muted font-bold tracking-wide uppercase">Outstanding Receivables</span>
          <p className="text-2xl font-display font-bold text-ink mt-2">
            INR {Number(summary.pendingAmount || 0).toLocaleString()}
          </p>
        </div>
        <div className="card p-5 border-l-4 border-rose-500">
          <span className="text-xs text-muted font-bold tracking-wide uppercase">Monthly Expenses</span>
          <p className="text-2xl font-display font-bold text-ink mt-2">
            INR {Number(summary.monthExpenses || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Invoices List */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-ink mb-4">Invoices Register</h3>
        <div className="space-y-3">
          {invoices.map((inv) => (
            <div key={inv.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-white">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <FileText size={14} className="text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">{inv.invoiceNumber} · {inv.project?.name ?? "General Engagement"}</p>
                <p className="text-xs text-muted">Due {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "TBD"}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-ink">INR {Number(inv.amount).toLocaleString()}</span>
                
                <select
                  value={inv.status}
                  onChange={(e) => handleStatusChange(inv.id, e.target.value)}
                  className="text-xs border border-slate-200 bg-white rounded p-1 font-semibold text-ink"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="SENT">Sent</option>
                  <option value="PAID">Paid</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>
            </div>
          ))}
          {invoices.length === 0 && <p className="text-xs text-muted">No invoices found.</p>}
        </div>
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6 bg-white space-y-4">
            <h3 className="font-semibold text-base text-ink">Create New Invoice</h3>
            
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="form-label text-xs font-semibold">Associated Project</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="form-input text-xs"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                  {projects.length === 0 && <option value="">No projects active</option>}
                </select>
              </div>

              <div>
                <label className="form-label text-xs font-semibold">Invoice Amount (INR)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="50000"
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="form-label text-xs font-semibold">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="form-input text-xs"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" disabled={loading} className="btn btn-primary btn-sm">{loading ? "Saving..." : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
