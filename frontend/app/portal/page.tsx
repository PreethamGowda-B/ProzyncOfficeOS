"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { Building2, FileText, CheckCircle2, Loader, FolderKanban, Clock } from "lucide-react";
import { clsx } from "clsx";

export default function ClientPortalPage() {
  const [me, setMe] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [user, projList, invList] = await Promise.all([
          api.me(),
          api.projects.list().catch(() => []),
          api.finance.invoices.list().catch(() => []),
        ]);
        setMe(user);
        setProjects(projList);
        setInvoices(invList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-32">
          <Loader size={22} className="text-muted animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink font-display">Client Portal</h1>
          <p className="text-sm text-muted mt-0.5">View your project timelines, invoices, and raise support tickets.</p>
        </div>
        {me && (
          <div className="flex items-center gap-2 card p-2 px-3">
            <Building2 size={14} className="text-accent" />
            <span className="text-xs font-semibold text-ink">{me.fullName}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {/* Active Projects */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
              <FolderKanban size={15} className="text-accent" />
              Project Progress
            </h3>
            {projects.length > 0 ? (
              <div className="space-y-5">
                {projects.map((proj) => {
                  const taskCount = proj._count?.tasks ?? 0;
                  return (
                    <div key={proj.id}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-ink">{proj.name}</p>
                          <p className="text-xs text-muted">Manager: {proj.manager?.fullName ?? "—"} · {taskCount} tasks</p>
                        </div>
                        <span className={clsx("badge text-[10px]",
                          proj.status === "DEVELOPMENT" ? "badge-blue" :
                          proj.status === "TESTING" ? "badge-purple" :
                          proj.status === "COMPLETED" ? "badge-green" : "badge-yellow"
                        )}>
                          {proj.status?.toLowerCase().replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted font-medium">Progress</span>
                        <span className="font-bold text-ink">In progress</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: proj.status === "COMPLETED" ? "100%" : "40%" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted text-center py-8">No projects found. Contact your account manager for project details.</p>
            )}
          </div>

          {/* Invoices */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
              <FileText size={15} className="text-indigo-500" />
              Invoices
            </h3>
            {invoices.length > 0 ? (
              <div className="space-y-3">
                {invoices.map((inv) => (
                  <div key={inv.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-white">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <FileText size={14} className="text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-ink">{inv.invoiceNumber} · {inv.project?.name ?? "General"}</p>
                      <p className="text-xs text-muted">Due {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-IN") : "TBD"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-ink">INR {Number(inv.amount).toLocaleString("en-IN")}</span>
                      <span className={clsx("badge text-[10px]",
                        inv.status === "PAID" ? "badge-green" :
                        inv.status === "OVERDUE" ? "badge-red" :
                        inv.status === "SENT" ? "badge-blue" : "badge-gray"
                      )}>
                        {inv.status?.toLowerCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted">No invoices issued yet.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink mb-3">Support & Tickets</h3>
            <p className="text-xs text-muted mb-4">Have questions? Raise a ticket and our development leads will respond within 24 hours.</p>
            <button className="btn btn-primary w-full justify-center">Create Support Ticket</button>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink mb-3">Quick Summary</h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted">Active Projects</span>
                <span className="font-bold text-ink">{projects.filter(p => p.status !== "COMPLETED").length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Total Invoiced</span>
                <span className="font-bold text-ink">INR {invoices.reduce((s, i) => s + Number(i.amount || 0), 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Paid Invoices</span>
                <span className="font-bold text-success">{invoices.filter(i => i.status === "PAID").length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Pending Payments</span>
                <span className="font-bold text-warning">{invoices.filter(i => i.status !== "PAID").length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
