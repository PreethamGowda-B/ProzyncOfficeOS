"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import {
  Search,
  Plus,
  Mail,
  Phone,
  ChevronDown,
  Grid3X3,
  List as ListIcon
} from "lucide-react";
import { clsx } from "clsx";

const ROLE_DISPLAY: Record<string, { label: string; badge: string }> = {
  SUPER_ADMIN: { label: "Super Admin", badge: "badge-purple" },
  COMPANY_ADMIN: { label: "Company Admin", badge: "badge-indigo" },
  HR_MANAGER: { label: "HR Manager", badge: "badge-pink" },
  PROJECT_MANAGER: { label: "Project Manager", badge: "badge-green" },
  TEAM_LEAD: { label: "Team Lead", badge: "badge-teal" },
  DEVELOPER: { label: "Developer", badge: "badge-blue" },
  UI_UX_DESIGNER: { label: "UI/UX Designer", badge: "badge-purple" },
  MOBILE_DEVELOPER: { label: "Mobile Dev", badge: "badge-teal" },
  QA_ENGINEER: { label: "QA Engineer", badge: "badge-yellow" },
  SALES_EXECUTIVE: { label: "Sales Exec", badge: "badge-red" },
  BUSINESS_DEVELOPMENT: { label: "Biz Dev", badge: "badge-purple" },
  FINANCE: { label: "Finance", badge: "badge-yellow" },
  INTERN: { label: "Intern", badge: "badge-gray" },
  CLIENT: { label: "Client", badge: "badge-green" },
};

const STATUS_BADGES: Record<string, string> = {
  ACTIVE: "badge-green",
  ONBOARDING: "badge-blue",
  PROBATION: "badge-yellow",
  ON_LEAVE: "badge-teal",
  SUSPENDED: "badge-red",
  RESIGNED: "badge-gray",
  TERMINATED: "badge-gray",
};

function getInitials(name: string) {
  return name?.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase() ?? "U";
}

const GRADIENTS = [
  "from-indigo-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-blue-600",
  "from-violet-500 to-purple-600",
];
function avatarGradient(name: string) {
  const hash = name?.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) ?? 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Invite Form state
  const [email, setEmail] = useState("");
  const [roleName, setRoleName] = useState("DEVELOPER");
  const [inviteDeptId, setInviteDeptId] = useState("");
  const [inviteTeamId, setInviteTeamId] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [empList, deptList, teamList] = await Promise.all([
        api.employees.list(),
        api.departments.list(),
        api.teams.list(),
      ]);
      setEmployees(empList);
      setDepartments(deptList);
      setTeams(teamList);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.invite({
        email,
        roleName,
        departmentId: inviteDeptId || undefined,
        teamId: inviteTeamId || undefined,
      });
      setEmail("");
      setShowInviteModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = employees.filter((e) => {
    const matchSearch =
      e.fullName.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      (e.department?.name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchDept = dept === "All" || e.department?.name === dept;
    return matchSearch && matchDept;
  });

  return (
    <AppShell>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Employees</h1>
          <p className="text-sm text-muted mt-0.5">{employees.length} people · {departments.length} departments</p>
        </div>
        <button onClick={() => setShowInviteModal(true)} className="btn btn-primary gap-1.5">
          <Plus size={14} />
          Invite Employee
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, dept…"
            className="form-input pl-9"
          />
        </div>

        {/* Dept filter */}
        <div className="relative">
          <select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            className="form-input pr-8 appearance-none cursor-pointer min-w-[160px]"
          >
            <option value="All">All Departments</option>
            {departments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        </div>

        {/* View toggle */}
        <div className="flex border border-border rounded-lg overflow-hidden bg-white ml-auto">
          <button
            onClick={() => setView("grid")}
            className={clsx("px-3 py-2 transition-colors", view === "grid" ? "bg-accent text-white" : "text-muted hover:text-ink")}
          >
            <Grid3X3 size={15} />
          </button>
          <button
            onClick={() => setView("list")}
            className={clsx("px-3 py-2 transition-colors", view === "list" ? "bg-accent text-white" : "text-muted hover:text-ink")}
          >
            <ListIcon size={15} />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {view === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((emp) => {
            const role = ROLE_DISPLAY[emp.role?.name] ?? { label: emp.role?.name ?? "Employee", badge: "badge-gray" };
            return (
              <a
                key={emp.id}
                href={`/employees/${emp.id}`}
                className="card p-5 flex flex-col items-center text-center group cursor-pointer hover:border-accent/30 hover:-translate-y-0.5 transition-all"
              >
                <div className={clsx("avatar avatar-xl bg-gradient-to-br", avatarGradient(emp.fullName), "mb-3 ring-4 ring-white shadow-md")}>
                  {getInitials(emp.fullName)}
                </div>
                <p className="font-semibold text-sm text-ink group-hover:text-accent transition-colors">
                  {emp.displayName ?? emp.fullName}
                </p>
                <p className="text-xs text-muted mt-0.5">{emp.department?.name ?? "General"}</p>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap justify-center">
                  <span className={clsx("badge", role.badge)}>{role.label}</span>
                  <span className={clsx("badge", STATUS_BADGES[emp.status] ?? "badge-gray")}>
                    {emp.status.toLowerCase()}
                  </span>
                </div>
                <div className="w-full mt-4 pt-4 border-t border-border space-y-1.5">
                  <div className="flex items-center gap-1.5 justify-center">
                    <Mail size={11} className="text-muted" />
                    <span className="text-[11px] text-muted truncate max-w-[150px]">{emp.email}</span>
                  </div>
                  {emp.phone && (
                    <div className="flex items-center gap-1.5 justify-center">
                      <Phone size={11} className="text-muted" />
                      <span className="text-[11px] text-muted">{emp.phone}</span>
                    </div>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="card overflow-hidden p-0">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Skills</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => {
                const role = ROLE_DISPLAY[emp.role?.name] ?? { label: emp.role?.name ?? "Employee", badge: "badge-gray" };
                return (
                  <tr
                    key={emp.id}
                    className="cursor-pointer"
                    onClick={() => window.location.href = `/employees/${emp.id}`}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={clsx("avatar avatar-sm bg-gradient-to-br flex-shrink-0", avatarGradient(emp.fullName))}>
                          {getInitials(emp.fullName)}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-ink">{emp.displayName ?? emp.fullName}</p>
                          <p className="text-xs text-muted">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm">{emp.department?.name ?? "General"}</td>
                    <td><span className={clsx("badge", role.badge)}>{role.label}</span></td>
                    <td>
                      <span className={clsx("badge", STATUS_BADGES[emp.status] ?? "badge-gray")}>
                        {emp.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="text-sm text-muted whitespace-nowrap">
                      {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : "TBD"}
                    </td>
                    <td>
                      <div className="flex gap-1 flex-wrap">
                        {emp.profile?.skills?.slice(0, 2).map((s: string) => (
                          <span key={s} className="badge badge-gray text-[10px]">{s}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
            <Search size={22} className="text-muted" />
          </div>
          <p className="text-sm font-semibold text-ink">No employees found</p>
          <p className="text-xs text-muted mt-1">Try adjusting your search or filter.</p>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6 bg-white space-y-4">
            <h3 className="font-semibold text-base text-ink">Invite New Employee</h3>
            
            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label className="form-label text-xs font-semibold">Work Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. employee@company.com"
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="form-label text-xs font-semibold">Target Role</label>
                <select
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="form-input text-xs"
                >
                  {Object.keys(ROLE_DISPLAY).map((r) => (
                    <option key={r} value={r}>{ROLE_DISPLAY[r].label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-xs font-semibold">Department</label>
                  <select
                    value={inviteDeptId}
                    onChange={(e) => setInviteDeptId(e.target.value)}
                    className="form-input text-xs"
                  >
                    <option value="">None</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label text-xs font-semibold">Team</label>
                  <select
                    value={inviteTeamId}
                    onChange={(e) => setInviteTeamId(e.target.value)}
                    className="form-input text-xs"
                  >
                    <option value="">None</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button type="button" onClick={() => setShowInviteModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" disabled={loading} className="btn btn-primary btn-sm">{loading ? "Sending..." : "Send Invitation"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
