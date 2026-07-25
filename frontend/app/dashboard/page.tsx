"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import {
  CheckCircle2, Clock, AlertTriangle, TrendingUp, Star, Calendar, Zap, ArrowUpRight,
  ArrowRight, Plus, Target, Coffee, ChevronRight,
} from "lucide-react";
import { clsx } from "clsx";

function priorityBadge(p: string) {
  const map: Record<string, string> = {
    LOW: "priority-low", MEDIUM: "priority-medium", HIGH: "priority-high", URGENT: "priority-urgent",
  };
  return map[p] ?? "badge badge-gray";
}

function statusBadge(s: string) {
  const map: Record<string, string> = {
    TODO: "status-todo", IN_PROGRESS: "status-in_progress", IN_REVIEW: "status-in_review",
    QA: "status-qa", DONE: "status-done", BLOCKED: "status-blocked",
  };
  return map[s] ?? "badge badge-gray";
}

function projectStatusBadge(s: string) {
  const map: Record<string, string> = {
    DRAFT: "badge-gray", PLANNING: "badge-yellow", DEVELOPMENT: "badge-blue",
    TESTING: "badge-purple", UAT: "badge-teal", DEPLOYMENT: "badge-green",
    COMPLETED: "badge-green", ON_HOLD: "badge-red", CANCELLED: "badge-red",
  };
  return "badge " + (map[s] ?? "badge-gray");
}

function Widget({ title, action, actionHref = "#", children, className = "" }: {
  title: string; action?: string; actionHref?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={clsx("card p-5 flex flex-col", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {action && (
          <a href={actionHref} className="flex items-center gap-1 text-xs text-accent hover:underline font-medium">
            {action}<ChevronRight size={12} />
          </a>
        )}
      </div>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const [me, setMe] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [points, setPoints] = useState<any>({ totalAllTime: 0, thisMonth: 0 });
  const [pointsLedger, setPointsLedger] = useState<any[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<any>({ sick: 0, casual: 0, earned: 0 });
  const [todayUpdateDone, setTodayUpdateDone] = useState(false);
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    const load = async () => {
      try {
        const [user, taskList, projectList, annList, mtgList, myScore, ledger, balance, history] = await Promise.all([
          api.me(),
          api.tasks.list(),
          api.projects.list(),
          api.announcements.list(),
          api.meetings.upcoming().catch(() => []),
          api.points.myScore().catch(() => ({ totalAllTime: 0, thisMonth: 0 })),
          api.points.ledger().catch(() => []),
          api.hr.leaveBalance().catch(() => null),
          api.dailyUpdates.myHistory().catch(() => []),
        ]);
        setMe(user);
        setTasks(taskList);
        setProjects(projectList);
        setAnnouncements(annList);
        setMeetings(mtgList);
        setPoints(myScore);
        setPointsLedger(ledger.slice(0, 5));
        if (balance) setLeaveBalance(balance);

        // Check if today's update was submitted
        const todayStr = new Date().toISOString().slice(0, 10);
        const done = history.some((h: any) => h.date?.startsWith(todayStr));
        setTodayUpdateDone(done);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const myTasks = tasks.filter((t) => t.assigneeId === me?.id || t.assignee?.id === me?.id).slice(0, 5);
  const todayMeetings = meetings.filter((m: any) => {
    if (!m.scheduledAt) return false;
    const d = new Date(m.scheduledAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  // Stats
  const inProgressCount = myTasks.filter((t) => t.status === "IN_PROGRESS").length;
  const todoCount = myTasks.filter((t) => t.status === "TODO").length;
  const doneThisMonth = tasks.filter((t) => t.status === "DONE" && t.updatedAt?.startsWith(new Date().toISOString().slice(0, 7))).length;

  const STATS = [
    { id: "today", label: "My Active Tasks", value: myTasks.length, sub: `${inProgressCount} in progress`, icon: Target, color: "text-accent", bg: "bg-accent-light" },
    { id: "pending", label: "Pending Tasks", value: todoCount, sub: "not yet started", icon: Clock, color: "text-warning", bg: "bg-warning-light" },
    { id: "completed", label: "Completed", value: doneThisMonth, sub: "this month", icon: CheckCircle2, color: "text-success", bg: "bg-success-light" },
    { id: "score", label: "Performance Score", value: points.thisMonth ?? 0, sub: "pts this month", icon: Star, color: "text-yellow-500", bg: "bg-yellow-50" },
  ];

  return (
    <AppShell>
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted mb-1">
            <Coffee size={13} />
            <span>{today}</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {greeting}{me ? `, ${me.displayName ?? me.fullName.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="text-sm text-muted mt-0.5">
            {loading ? "Loading your workspace..." : "Here's your workspace overview for today."}
          </p>
        </div>
        <a href="/daily-update" className="btn btn-primary btn-sm gap-1.5 hidden md:inline-flex">
          <Plus size={14} />
          Daily Update
        </a>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STATS.map((stat, i) => (
          <div key={stat.id} className={clsx("card-stat animate-fade-in", `stagger-${i + 1}`)}>
            <div className="flex items-start justify-between mb-3">
              <div className={clsx("w-9 h-9 rounded-lg flex items-center justify-center", stat.bg)}>
                <stat.icon size={17} className={stat.color} />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-medium text-success">
                <ArrowUpRight size={11} />
                <span className="hidden sm:inline">Live data</span>
              </div>
            </div>
            <p className="font-display text-3xl font-bold text-ink">{stat.value}</p>
            <p className="text-xs font-medium text-ink mt-0.5">{stat.label}</p>
            <p className="text-[11px] text-muted mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Main Grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Left column — 2/3 width */}
        <div className="xl:col-span-2 space-y-5">

          {/* Today's Tasks */}
          <Widget title="My Tasks" action="View all" actionHref="/tasks">
            <div className="space-y-2">
              {myTasks.length > 0 ? myTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface transition-colors cursor-pointer group">
                  <div className={clsx(
                    "w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all",
                    task.status === "IN_PROGRESS" ? "border-accent bg-accent/10" : "border-border"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{task.title}</p>
                    <p className="text-[11px] text-muted">{task.project?.name ?? "OfficeOS"} · Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={priorityBadge(task.priority ?? "LOW")}>{(task.priority ?? "low").toLowerCase()}</span>
                    <span className={statusBadge(task.status)}>{(task.status ?? "todo").replace("_", " ").toLowerCase()}</span>
                  </div>
                  <ArrowRight size={13} className="text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )) : (
                <p className="text-xs text-muted text-center py-6">No tasks assigned to you yet. <a href="/tasks" className="text-accent hover:underline">Browse all tasks →</a></p>
              )}
            </div>
            <a href="/tasks" className="mt-4 flex items-center justify-center gap-1.5 text-xs text-accent font-medium hover:underline">
              <Plus size={13} />
              Add a task
            </a>
          </Widget>

          {/* Project Progress */}
          <Widget title="Active Projects" action="All projects" actionHref="/projects">
            <div className="space-y-4">
              {projects.slice(0, 4).length > 0 ? projects.slice(0, 4).map((proj, idx) => {
                const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444"];
                const color = COLORS[idx % COLORS.length];
                const taskCount = proj._count?.tasks ?? 0;
                const doneCount = 0; // No granular per-project done count from list endpoint
                return (
                  <a key={proj.id} href={`/projects/${proj.id}`} className="block group cursor-pointer">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                        <p className="text-sm font-medium text-ink group-hover:text-accent transition-colors">{proj.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={projectStatusBadge(proj.status)}>{proj.status.toLowerCase().replace("_", " ")}</span>
                        <span className="text-xs text-muted">{taskCount} tasks</span>
                      </div>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: "20%", background: `linear-gradient(90deg, ${color}, ${color}99)` }} />
                    </div>
                  </a>
                );
              }) : (
                <p className="text-xs text-muted text-center py-4">No projects found. <a href="/projects" className="text-accent hover:underline">Create one →</a></p>
              )}
            </div>
          </Widget>
        </div>

        {/* Right column — 1/3 width */}
        <div className="space-y-5">

          {/* Daily Update Status */}
          <Widget title="Daily Update" action="Submit now" actionHref="/daily-update">
            <div className={clsx(
              "flex items-center gap-3 rounded-lg px-4 py-3 border",
              todayUpdateDone ? "bg-success-light border-success/20" : "bg-warning-light border-warning/20"
            )}>
              {todayUpdateDone
                ? <CheckCircle2 size={18} className="text-success flex-shrink-0" />
                : <AlertTriangle size={18} className="text-warning flex-shrink-0" />
              }
              <div>
                <p className="text-xs font-semibold" style={{ color: todayUpdateDone ? "#059669" : "#D97706" }}>
                  {todayUpdateDone ? "Update submitted ✓" : "Daily update pending"}
                </p>
                <p className="text-xs text-muted mt-0.5">
                  {todayUpdateDone ? "Great work! You've submitted today's progress." : "Submit before end of day to earn +1 point."}
                </p>
              </div>
            </div>
          </Widget>

          {/* Upcoming Meetings */}
          <Widget title="Today's Meetings" action="All" actionHref="/meetings">
            {todayMeetings.length === 0 ? (
              <p className="text-xs text-muted text-center py-4">No meetings scheduled today 🎉</p>
            ) : (
              <div className="space-y-3">
                {todayMeetings.map((m: any) => (
                  <div key={m.id} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-accent/30 hover:bg-accent-light/20 transition-all cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center flex-shrink-0">
                      <Calendar size={14} className="text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-ink">{m.title}</p>
                      <p className="text-[11px] text-muted">{new Date(m.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} · {m.durationMinutes ?? 30} min</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Widget>

          {/* Points Activity */}
          <Widget title="Points Activity" action="Leaderboard" actionHref="/leaderboard">
            <div className="space-y-2.5">
              {pointsLedger.length > 0 ? pointsLedger.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={clsx("w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0", p.points > 0 ? "bg-success-light" : "bg-danger-light")}>
                      {p.points > 0 ? <Zap size={10} className="text-success" /> : <AlertTriangle size={10} className="text-danger" />}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-ink">{p.reason}</p>
                      <p className="text-[10px] text-muted">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ""}</p>
                    </div>
                  </div>
                  <span className={clsx("text-xs font-bold", p.points > 0 ? "text-success" : "text-danger")}>
                    {p.points > 0 ? "+" : ""}{p.points}
                  </span>
                </div>
              )) : (
                <p className="text-xs text-muted text-center py-3">Submit daily updates to start earning points!</p>
              )}
            </div>
          </Widget>

          {/* Leave Balance */}
          <Widget title="Leave Balance">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Sick", value: leaveBalance.sick ?? 0, color: "text-danger" },
                { label: "Casual", value: leaveBalance.casual ?? 0, color: "text-warning" },
                { label: "Earned", value: leaveBalance.earned ?? 0, color: "text-success" },
              ].map((lb) => (
                <div key={lb.label} className="text-center p-2.5 rounded-lg bg-surface border border-border">
                  <p className={clsx("font-display text-2xl font-bold", lb.color)}>{lb.value}</p>
                  <p className="text-[10px] text-muted font-medium mt-0.5">{lb.label}</p>
                </div>
              ))}
            </div>
            <a href="/hr" className="mt-3 btn btn-secondary btn-sm w-full justify-center">
              Apply for Leave
            </a>
          </Widget>

          {/* Announcements */}
          <Widget title="Announcements" action="All" actionHref="/announcements">
            <div className="space-y-3">
              {announcements.slice(0, 3).length > 0 ? announcements.slice(0, 3).map((a: any) => (
                <div key={a.id} className="flex gap-2.5 group cursor-pointer">
                  <div className="w-1 rounded-full bg-accent flex-shrink-0 self-stretch" />
                  <div>
                    <p className="text-xs font-semibold text-ink group-hover:text-accent transition-colors">{a.title}</p>
                    <p className="text-[11px] text-muted leading-snug mt-0.5 line-clamp-2">{a.body}</p>
                    <p className="text-[10px] text-muted/60 mt-1">{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ""}</p>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-muted text-center py-3">No announcements yet.</p>
              )}
            </div>
          </Widget>
        </div>
      </div>
    </AppShell>
  );
}
