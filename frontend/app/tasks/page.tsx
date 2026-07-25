"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { Plus, Search, Check, AlertCircle } from "lucide-react";
import { clsx } from "clsx";

const COLUMNS = [
  { key: "TODO", label: "To Do", bg: "bg-slate-100 border-slate-200" },
  { key: "IN_PROGRESS", label: "In Progress", bg: "bg-blue-50/50 border-blue-100" },
  { key: "IN_REVIEW", label: "In Review", bg: "bg-purple-50/50 border-purple-100" },
  { key: "QA", label: "QA Check", bg: "bg-amber-50/50 border-amber-100" },
  { key: "DONE", label: "Done", bg: "bg-emerald-50/50 border-emerald-100" },
];

function priorityColor(p: string) {
  switch (p) {
    case "URGENT": return "badge-red";
    case "HIGH": return "badge-red";
    case "MEDIUM": return "badge-yellow";
    default: return "badge-blue";
  }
}

export default function TasksPage() {
  const [search, setSearch] = useState("");
  const [tasks, setTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState("HIGH");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [tList, eList, pList] = await Promise.all([
        api.tasks.list(),
        api.employees.list(),
        api.projects.list(),
      ]);
      setTasks(tList);
      setEmployees(eList);
      setProjects(pList);
      if (pList.length > 0 && !projectId) setProjectId(pList[0].id);
      if (eList.length > 0 && !assigneeId) setAssigneeId(eList[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !projectId) return;

    setLoading(true);
    try {
      await api.tasks.create({
        title,
        description,
        projectId,
        assigneeId: assigneeId || undefined,
        priority,
      });
      setTitle("");
      setDescription("");
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await api.tasks.updateStatus(taskId, newStatus);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.project?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink font-display">Task Workspace</h1>
          <p className="text-sm text-muted mt-0.5">Manage assignments, track coding deadlines, and submit for reviews.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary gap-1.5">
          <Plus size={14} />
          New Task
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative max-w-sm flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            placeholder="Search tasks..."
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-9"
          />
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colTasks = filtered.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className={clsx("rounded-xl border p-4 flex flex-col min-h-[500px]", col.bg)}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-ink uppercase tracking-wider">{col.label}</span>
                <span className="badge badge-gray text-[10px] font-bold">{colTasks.length}</span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.map((t) => (
                  <div key={t.id} className="card p-4 hover:border-accent/40 shadow-sm bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-muted font-bold tracking-wide uppercase">{t.project?.name ?? "OfficeOS"}</span>
                      <span className={clsx("badge text-[9px]", priorityColor(t.priority))}>{t.priority?.toLowerCase()}</span>
                    </div>
                    <p className="text-xs font-semibold text-ink leading-tight mb-3">
                      {t.title}
                    </p>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-1">
                        <div className="avatar avatar-sm w-4 h-4 text-[8px] bg-slate-200 text-slate-800">
                          {t.assignee?.fullName?.split(" ").map((n: string) => n[0]).join("") ?? "U"}
                        </div>
                        <span className="text-[10px] text-muted font-medium">{t.assignee?.fullName ?? "Unassigned"}</span>
                      </div>
                      
                      {/* Interactive Status Changer */}
                      <select
                        value={t.status}
                        onChange={(e) => handleStatusChange(t.id, e.target.value)}
                        className="text-[10px] border border-slate-200 bg-white rounded p-0.5 font-semibold text-ink"
                      >
                        {COLUMNS.map((c) => (
                          <option key={c.key} value={c.key}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6 bg-white space-y-4">
            <h3 className="font-semibold text-base text-ink">Create New Task</h3>
            
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="form-label text-xs font-semibold">Task Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Write R2 storage hook"
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="form-label text-xs font-semibold">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details..."
                  className="form-input text-xs h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-xs font-semibold">Project</label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="form-input text-xs"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                    {projects.length === 0 && <option value="">No Projects found</option>}
                  </select>
                </div>

                <div>
                  <label className="form-label text-xs font-semibold">Assignee</label>
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="form-input text-xs"
                  >
                    <option value="">Unassigned</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>{e.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label text-xs font-semibold">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="form-input text-xs"
                >
                  <option value="URGENT">Urgent</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
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
