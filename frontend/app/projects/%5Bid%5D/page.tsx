"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, Plus } from "lucide-react";
import { clsx } from "clsx";

const TABS = ["Overview", "Milestones", "Risks"] as const;

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [tab, setTab] = useState<typeof TABS[number]>("Overview");
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.projects.get(id)
        .then((data) => {
          setProject(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <AppShell>
        <p className="text-xs text-muted">Loading project details...</p>
      </AppShell>
    );
  }

  if (!project) {
    return (
      <AppShell>
        <div className="space-y-4">
          <p className="text-xs text-muted">Project not found or you don't have access.</p>
          <button onClick={() => router.push("/projects")} className="btn btn-secondary btn-sm flex items-center gap-1">
            <ArrowLeft size={12} /> Back to Projects
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-4">
        <button onClick={() => router.push("/projects")} className="flex items-center gap-1.5 text-xs text-muted hover:text-ink w-fit">
          <ArrowLeft size={13} />
          Back to Projects
        </button>
      </div>

      <div className="flex items-start justify-between mb-5 flex-wrap gap-4">
        <div>
          <span className="text-[10px] text-muted font-bold tracking-wide uppercase">{project.client?.companyName ?? "Internal"}</span>
          <h1 className="font-display text-2xl font-semibold text-ink mt-0.5">{project.name}</h1>
        </div>
        <span className="badge badge-blue">{project.status?.toLowerCase() ?? "development"}</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              "px-4 py-2 text-sm font-semibold border-b-2 transition-all -mb-px",
              tab === t ? "border-accent text-accent" : "border-transparent text-muted hover:text-ink"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {tab === "Overview" && (
            <div className="card p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-ink mb-1.5">Description</h3>
                <p className="text-xs text-muted leading-relaxed">{project.description || "No description provided."}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <span className="text-xs text-muted">Start Date</span>
                  <p className="text-xs font-semibold text-ink mt-0.5">{project.startDate ? new Date(project.startDate).toLocaleDateString() : "TBD"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted">Estimated Delivery</span>
                  <p className="text-xs font-semibold text-ink mt-0.5">{project.endDate ? new Date(project.endDate).toLocaleDateString() : "TBD"}</p>
                </div>
              </div>
            </div>
          )}

          {tab === "Milestones" && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-ink">Project Milestones</h3>
                <button className="btn btn-secondary btn-sm gap-1"><Plus size={12} /> Add Milestone</button>
              </div>
              <div className="space-y-3">
                {project.milestones?.map((m: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-surface transition-colors">
                    <div className={clsx(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                      m.completed ? "border-success bg-success-light text-success" : "border-slate-300 text-transparent"
                    )}>
                      {m.completed && <CheckCircle2Icon size={12} className="text-success fill-success-light" />}
                    </div>
                    <div className="flex-1">
                      <p className={clsx("text-sm font-semibold", m.completed ? "text-muted line-through" : "text-ink")}>{m.title}</p>
                      <p className="text-[10px] text-muted">Due {new Date(m.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                {(!project.milestones || project.milestones.length === 0) && (
                  <p className="text-xs text-muted">No milestones logged yet.</p>
                )}
              </div>
            </div>
          )}

          {tab === "Risks" && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-ink">Risk Assessments</h3>
                <button className="btn btn-secondary btn-sm gap-1"><Plus size={12} /> Log Risk</button>
              </div>
              <div className="space-y-4">
                {project.risks?.map((r: any, i: number) => (
                  <div key={i} className="p-3.5 rounded-lg border border-border bg-rose-50/20">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-bold text-ink">{r.title}</p>
                      <span className={clsx("badge", r.severity === "HIGH" ? "badge-red" : "badge-yellow")}>{r.severity?.toLowerCase()}</span>
                    </div>
                    <p className="text-xs text-muted mb-2">Mitigation: {r.mitigation || "None"}</p>
                  </div>
                ))}
                {(!project.risks || project.risks.length === 0) && (
                  <p className="text-xs text-muted">No active risks logged.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-5">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink mb-3">Project Budget</h3>
            <p className="text-xl font-display font-bold text-ink">
              {project.budget ? `INR ${Number(project.budget).toLocaleString()}` : "—"}
            </p>
            <p className="text-xs text-muted mt-0.5">Budget status monitored.</p>

            <div className="border-t border-slate-100 mt-4 pt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">Manager</span>
                <span className="font-semibold text-ink">{project.manager?.fullName ?? "Unassigned"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function CheckCircle2Icon({ size, className }: { size: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
