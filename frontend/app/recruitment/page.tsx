"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { Plus, Search } from "lucide-react";
import { clsx } from "clsx";

const STAGES = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"];

export default function RecruitmentPage() {
  const [tab, setTab] = useState<"jobs" | "candidates">("jobs");
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [description, setDescription] = useState("");
  const [openings, setOpenings] = useState(1);

  const loadData = async () => {
    try {
      const [jList, cList, dList] = await Promise.all([
        api.recruitment.jobs.list(),
        api.recruitment.candidates.list(),
        api.departments.list(),
      ]);
      setJobs(jList);
      setCandidates(cList);
      setDepartments(dList);
      if (dList.length > 0 && !departmentId) setDepartmentId(dList[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setLoading(true);
    try {
      await api.recruitment.jobs.create({
        title,
        departmentId: departmentId || undefined,
        description,
        openings: Number(openings),
      });
      setTitle("");
      setDescription("");
      setOpenings(1);
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (candId: string, newStage: string) => {
    try {
      await api.recruitment.candidates.updateStage(candId, newStage);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredJobs = jobs.filter((j) => j.title?.toLowerCase().includes(search.toLowerCase()));
  const filteredCandidates = candidates.filter((c) => c.fullName?.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink font-display">Recruitment Center</h1>
          <p className="text-sm text-muted mt-0.5">Manage open vacancies, schedule rounds, and issue offer letters.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary gap-1.5">
          <Plus size={14} />
          Create Job
        </button>
      </div>

      {/* Selector */}
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        <button
          onClick={() => { setTab("jobs"); setSearch(""); }}
          className={clsx("px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-all", tab === "jobs" ? "border-accent text-accent" : "border-transparent text-muted hover:text-ink")}
        >
          Job Openings ({jobs.length})
        </button>
        <button
          onClick={() => { setTab("candidates"); setSearch(""); }}
          className={clsx("px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-all", tab === "candidates" ? "border-accent text-accent" : "border-transparent text-muted hover:text-ink")}
        >
          Candidate Pipelines ({candidates.length})
        </button>
      </div>

      <div className="relative max-w-sm mb-6">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={search}
          placeholder={tab === "jobs" ? "Search jobs..." : "Search candidates..."}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input pl-9"
        />
      </div>

      {/* Grid */}
      {tab === "jobs" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((j) => (
            <div key={j.id} className="card p-5 flex flex-col hover:border-accent/30 transition-all bg-white">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-[10px] text-muted font-bold tracking-wide uppercase">{j.department?.name ?? "Engineering"}</span>
                  <h3 className="font-semibold text-base text-ink mt-0.5">{j.title}</h3>
                </div>
                <span className={clsx("badge", j.status === "OPEN" ? "badge-green" : "badge-gray")}>{j.status?.toLowerCase()}</span>
              </div>
              <p className="text-xs text-muted mb-4">{j.openings} active opening{j.openings > 1 ? "s" : ""}</p>
              
              <div className="border-t border-slate-100 pt-4 mt-auto flex items-center justify-between text-xs text-muted">
                <span>{j._count?.candidates ?? 0} applicants</span>
                <span className="text-accent font-semibold">Manage Vacancy</span>
              </div>
            </div>
          ))}
          {filteredJobs.length === 0 && <p className="text-xs text-muted">No vacancies found.</p>}
        </div>
      )}

      {tab === "candidates" && (
        <div className="card overflow-hidden p-0">
          <table className="data-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Target Vacancy</th>
                <th>Current Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((c) => (
                <tr key={c.id}>
                  <td>
                    <p className="font-semibold text-sm text-ink">{c.fullName}</p>
                    <p className="text-xs text-muted">{c.email}</p>
                  </td>
                  <td className="text-sm">{c.jobOpening?.title ?? "General Application"}</td>
                  <td>
                    <span className="badge badge-indigo">{c.stage?.toLowerCase()}</span>
                  </td>
                  <td>
                    <select
                      value={c.stage}
                      onChange={(e) => handleStageChange(c.id, e.target.value)}
                      className="text-xs border border-slate-200 bg-white rounded p-1 font-semibold text-ink"
                    >
                      {STAGES.map((s) => (
                        <option key={s} value={s}>{s.toLowerCase()}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {filteredCandidates.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-xs text-muted text-center py-4">No candidates logged in database.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6 bg-white space-y-4">
            <h3 className="font-semibold text-base text-ink">Create Job Opening</h3>
            
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="form-label text-xs font-semibold">Job Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Full Stack Developer"
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="form-label text-xs font-semibold">Department</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="form-input text-xs"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                  {departments.length === 0 && <option value="">No departments active</option>}
                </select>
              </div>

              <div>
                <label className="form-label text-xs font-semibold">Openings Count</label>
                <input
                  type="number"
                  value={openings}
                  onChange={(e) => setOpenings(Number(e.target.value))}
                  placeholder="1"
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="form-label text-xs font-semibold">Job Details</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add job requirements and details..."
                  className="form-input text-xs h-20"
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
