"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { BarChart3, TrendingUp, Users, FolderKanban, DollarSign, Target, Zap, Loader } from "lucide-react";

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [finSummary, setFinSummary] = useState<any>({ totalRevenue: 0, pendingAmount: 0, monthRevenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ceoData, empList, projList, taskList, fin] = await Promise.all([
          api.analytics.ceoMetrics().catch(() => null),
          api.employees.list().catch(() => []),
          api.projects.list().catch(() => []),
          api.tasks.list().catch(() => []),
          api.finance.summary().catch(() => ({ totalRevenue: 0, pendingAmount: 0, monthRevenue: 0 })),
        ]);
        setMetrics(ceoData);
        setEmployees(empList);
        setProjects(projList);
        setTasks(taskList);
        setFinSummary(fin);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const activeEmployees = employees.filter((e) => e.status === "ACTIVE").length;
  const activeProjects = projects.filter((p) => !["COMPLETED", "CANCELLED"].includes(p.status)).length;
  const doneTasks = tasks.filter((t) => t.status === "DONE").length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const STAT_CARDS = [
    { label: "Active Team Size", value: activeEmployees, icon: Users, color: "text-accent", bg: "bg-accent-light", sub: `${employees.length} total employees` },
    { label: "Ongoing Projects", value: activeProjects, icon: FolderKanban, color: "text-emerald-600", bg: "bg-emerald-50", sub: `${projects.length} total projects` },
    { label: "Revenue Received", value: `INR ${Number(finSummary.totalRevenue ?? 0).toLocaleString("en-IN")}`, icon: DollarSign, color: "text-indigo-600", bg: "bg-indigo-50", sub: `${Number(finSummary.monthRevenue ?? 0).toLocaleString("en-IN")} this month` },
    { label: "Task Completion Rate", value: `${completionRate}%`, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50", sub: `${doneTasks} of ${totalTasks} tasks done` },
  ];

  // Department breakdown
  const deptMap: Record<string, number> = {};
  employees.forEach((e) => {
    const d = e.department?.name ?? "Unassigned";
    deptMap[d] = (deptMap[d] ?? 0) + 1;
  });
  const deptData = Object.entries(deptMap).sort((a, b) => b[1] - a[1]);

  // Project status breakdown
  const statusMap: Record<string, number> = {};
  projects.forEach((p) => {
    statusMap[p.status] = (statusMap[p.status] ?? 0) + 1;
  });
  const statusData = Object.entries(statusMap).sort((a, b) => b[1] - a[1]);

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
          <h1 className="font-display text-2xl font-semibold text-ink font-display">CEO Analytics Dashboard</h1>
          <p className="text-sm text-muted mt-0.5">High-level aggregates of company health, revenue streams, and task productivity metrics.</p>
        </div>
        <span className="badge badge-green text-[10px]">Live Data</span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {STAT_CARDS.map((s) => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted font-bold tracking-wide uppercase">{s.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.bg}`}>
                <s.icon size={16} className={s.color} />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-ink">{s.value}</p>
            <p className="text-[11px] text-muted mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Breakdown grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Department breakdown */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
            <Users size={15} className="text-accent" />
            Headcount by Department
          </h3>
          {deptData.length > 0 ? (
            <div className="space-y-3">
              {deptData.map(([dept, count]) => (
                <div key={dept}>
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span className="font-medium text-ink">{dept}</span>
                    <span className="text-muted font-semibold">{count} people · {Math.round(count / employees.length * 100)}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${Math.round(count / employees.length * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted">No employee data yet.</p>
          )}
        </div>

        {/* Project status breakdown */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
            <FolderKanban size={15} className="text-emerald-600" />
            Projects by Status
          </h3>
          {statusData.length > 0 ? (
            <div className="space-y-3">
              {statusData.map(([status, count]) => {
                const colors: Record<string, string> = {
                  PLANNING: "bg-yellow-500", DEVELOPMENT: "bg-blue-500", TESTING: "bg-purple-500",
                  COMPLETED: "bg-emerald-500", ON_HOLD: "bg-red-400", CANCELLED: "bg-gray-400",
                };
                const bar = colors[status] ?? "bg-accent";
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span className="font-medium text-ink capitalize">{status.toLowerCase().replace("_", " ")}</span>
                      <span className="text-muted font-semibold">{count} projects</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${bar}`} style={{ width: `${Math.round(count / projects.length * 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted">No project data yet.</p>
          )}
        </div>
      </div>

      {/* Task Summary */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
          <Target size={15} className="text-amber-600" />
          Task Pipeline Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {["TODO", "IN_PROGRESS", "IN_REVIEW", "QA", "DONE"].map((status) => {
            const count = tasks.filter((t) => t.status === status).length;
            const colors: Record<string, string> = {
              TODO: "bg-slate-100 text-slate-700",
              IN_PROGRESS: "bg-blue-100 text-blue-700",
              IN_REVIEW: "bg-purple-100 text-purple-700",
              QA: "bg-amber-100 text-amber-700",
              DONE: "bg-emerald-100 text-emerald-700",
            };
            return (
              <div key={status} className={`p-3 rounded-xl text-center ${colors[status] ?? "bg-slate-100 text-slate-700"}`}>
                <p className="text-2xl font-bold font-display">{count}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider mt-1">{status.replace("_", " ")}</p>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
