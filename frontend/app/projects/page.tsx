"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { Plus, Clock, Target, Users, Search } from "lucide-react";
import { clsx } from "clsx";

function statusColor(s: string) {
  switch (s) {
    case "DEVELOPMENT": return "badge-blue";
    case "TESTING": return "badge-purple";
    case "PLANNING": return "badge-yellow";
    default: return "badge-green";
  }
}

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [me, setMe] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState(0);
  const [endDate, setEndDate] = useState("");

  const loadData = async () => {
    try {
      const [pList, cList, user] = await Promise.all([
        api.projects.list(),
        api.clients.list().catch(() => []),
        api.me(),
      ]);
      setProjects(pList);
      setClients(cList);
      setMe(user);
      if (cList.length > 0 && !clientId) setClientId(cList[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !me) return;

    setLoading(true);
    try {
      await api.projects.create({
        name,
        clientId: clientId || undefined,
        description,
        budget: budget ? Number(budget) : undefined,
        endDate: endDate || undefined,
        managerId: me.id,
      });
      setName("");
      setDescription("");
      setBudget(0);
      setEndDate("");
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.client?.companyName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink font-display">Active Projects</h1>
          <p className="text-sm text-muted mt-0.5">Track timelines, budgets, and milestones across current engagements.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary gap-1.5">
          <Plus size={14} />
          Create Project
        </button>
      </div>

      <div className="relative max-w-sm mb-6">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={search}
          placeholder="Search projects..."
          onChange={(e) => setSearch(e.target.value)}
          className="form-input pl-9"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((p) => (
          <a key={p.id} href={`/projects/${p.id}`} className="card p-5 hover:border-accent/40 cursor-pointer flex flex-col group transition-all">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-[10px] text-muted font-bold tracking-wide uppercase">{p.client?.companyName ?? "Internal"}</span>
                <h3 className="font-semibold text-base text-ink group-hover:text-accent transition-colors leading-tight mt-0.5">
                  {p.name}
                </h3>
              </div>
              <span className={clsx("badge", statusColor(p.status))}>{p.status?.toLowerCase() ?? "development"}</span>
            </div>

            <p className="text-xs text-muted mb-4">Manager: {p.manager?.fullName ?? "Unassigned"}</p>

            <div className="space-y-1.5 mb-5 mt-auto">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">Progress</span>
                <span className="font-bold text-ink">34%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: "34%" }} />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-muted">
              <span className="flex items-center gap-1.5"><Clock size={12} /> Due {p.endDate ? new Date(p.endDate).toLocaleDateString() : "TBD"}</span>
              <span className="font-medium text-ink">{p.budget ? `INR ${Number(p.budget).toLocaleString()}` : "—"}</span>
            </div>
          </a>
        ))}
        {filtered.length === 0 && <p className="text-xs text-muted">No projects found.</p>}
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6 bg-white space-y-4">
            <h3 className="font-semibold text-base text-ink">Create New Project</h3>
            
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="form-label text-xs font-semibold">Project Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Prozync Mobile App"
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="form-label text-xs font-semibold">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details..."
                  className="form-input text-xs h-20"
                />
              </div>

              <div>
                <label className="form-label text-xs font-semibold">Client (Optional)</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="form-input text-xs"
                >
                  <option value="">No Client (Internal Project)</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.companyName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label text-xs font-semibold">Budget (INR)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  placeholder="100000"
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="form-label text-xs font-semibold">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
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
