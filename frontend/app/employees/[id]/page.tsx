"use client";

import AppShell from "@/components/layout/AppShell";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Award,
  Shield,
  Edit,
  MoreVertical,
  CheckCircle2,
  Star,
  TrendingUp,
  FileText,
  Monitor,
  AlertCircle,
  Clock,
  MessageSquare,
} from "lucide-react";
import { clsx } from "clsx";

// Mock — will be fetched by id from API
const MOCK_EMP = {
  id: "e1",
  fullName: "Preetham Gowda B",
  displayName: "Mr. Preethu Gowda",
  role: "SUPER_ADMIN",
  dept: "Leadership",
  team: null,
  email: "founder@prozync.com",
  phone: "+91 98765 43210",
  joining: "2023-01-01",
  status: "ACTIVE",
  employmentType: "FULL_TIME",
  bio: "Founder & CEO of Prozync Innovations. Building the future of work management for development teams.",
  skills: ["Strategy", "Product Management", "Leadership", "TypeScript", "React", "NestJS", "System Design"],
  experienceYears: 5,
  emergencyContact: { name: "Gowda B.", relation: "Father", phone: "+91 98765 99999" },
  certifications: [
    { name: "AWS Solutions Architect", issuer: "Amazon", issued: "2023-06", expiry: "2026-06" },
    { name: "PMP Certification", issuer: "PMI", issued: "2022-09", expiry: "2025-09" },
  ],
  documents: [
    { name: "Offer Letter.pdf", category: "offer_letter", date: "2023-01-01" },
    { name: "Aadhar Card.pdf", category: "id_proof", date: "2023-01-01" },
  ],
  equipment: [
    { item: "MacBook Pro 16\"", serial: "MBP-2023-001", issued: "2023-01-05" },
    { item: "Dell Monitor 27\"", serial: "DEL-MON-042", issued: "2023-01-05" },
  ],
  promotions: [
    { from: "Lead Developer", to: "CTO", date: "2023-06-01" },
    { from: "CTO", to: "CEO", date: "2024-01-01" },
  ],
  leaveBalance: { sick: 8, casual: 5, earned: 12 },
  performance: { score: 142, rank: 1, topPerformer: true },
};

const TABS = ["Overview", "Tasks", "Documents", "Equipment", "Salary", "History"] as const;
type Tab = typeof TABS[number];

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

const GRADIENTS = [
  "from-indigo-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
];

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

import { useState } from "react";

export default function EmployeeProfilePage() {
  const [tab, setTab] = useState<Tab>("Overview");
  const emp = MOCK_EMP;
  const role = ROLE_DISPLAY[emp.role] ?? { label: emp.role, badge: "badge-gray" };

  return (
    <AppShell>
      {/* Back nav */}
      <div className="mb-5">
        <a href="/employees" className="flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors w-fit">
          <ArrowLeft size={15} />
          Back to Employees
        </a>
      </div>

      {/* Profile hero card */}
      <div className="card p-0 overflow-hidden mb-5">
        {/* Banner */}
        <div
          className="h-28"
          style={{ background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)" }}
        />

        <div className="px-6 pb-6">
          {/* Avatar + actions */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="relative">
              <div className={clsx(
                "avatar bg-gradient-to-br ring-4 ring-white shadow-lg",
                "from-indigo-500 to-purple-600"
              )}
                style={{ width: 80, height: 80, fontSize: "1.4rem" }}
              >
                {getInitials(emp.fullName)}
              </div>
              {emp.performance.topPerformer && (
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center">
                  <Star size={12} className="text-white fill-white" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mb-1">
              <button className="btn btn-ghost btn-sm gap-1">
                <MessageSquare size={13} />
                Message
              </button>
              <button className="btn btn-secondary btn-sm gap-1">
                <Edit size={13} />
                Edit Profile
              </button>
              <button className="btn btn-ghost btn-sm px-2">
                <MoreVertical size={15} />
              </button>
            </div>
          </div>

          {/* Name + meta */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink">
                {emp.displayName ?? emp.fullName}
              </h1>
              {emp.displayName && (
                <p className="text-sm text-muted">{emp.fullName}</p>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={clsx("badge", role.badge)}>{role.label}</span>
                <span className="badge badge-green">{emp.status.toLowerCase()}</span>
                <span className="badge badge-gray">{emp.employmentType.replace("_", " ").toLowerCase()}</span>
                {emp.performance.topPerformer && (
                  <span className="badge badge-yellow">⭐ Top Performer</span>
                )}
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
                <span className="flex items-center gap-1.5 text-xs text-muted">
                  <Briefcase size={12} /> {emp.dept}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted">
                  <Mail size={12} /> {emp.email}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted">
                  <Phone size={12} /> {emp.phone}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted">
                  <Calendar size={12} /> Joined {new Date(emp.joining).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted">
                  <Clock size={12} /> {emp.experienceYears} years experience
                </span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex gap-3 flex-shrink-0">
              {[
                { label: "Points", value: emp.performance.score, icon: TrendingUp, color: "text-accent" },
                { label: "Rank", value: `#${emp.performance.rank}`, icon: Award, color: "text-yellow-500" },
              ].map((stat) => (
                <div key={stat.label} className="text-center bg-surface rounded-xl px-4 py-3 border border-border min-w-[80px]">
                  <stat.icon size={16} className={clsx("mx-auto mb-1", stat.color)} />
                  <p className="font-display text-xl font-bold text-ink">{stat.value}</p>
                  <p className="text-[10px] text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {emp.bio && (
            <p className="mt-4 text-sm text-muted leading-relaxed border-t border-border pt-4">{emp.bio}</p>
          )}
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-0.5 mb-5 bg-surface rounded-xl p-1 border border-border w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            id={`profile-tab-${t.toLowerCase()}`}
            className={clsx(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all",
              tab === t
                ? "bg-white text-ink shadow-card"
                : "text-muted hover:text-ink"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {tab === "Overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              {/* Skills */}
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-ink mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {emp.skills.map((skill) => (
                    <span key={skill} className="badge badge-indigo px-3 py-1">{skill}</span>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-ink mb-3">Certifications</h3>
                <div className="space-y-3">
                  {emp.certifications.map((cert, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-surface border border-border">
                      <div className="w-8 h-8 rounded-lg bg-success-light flex items-center justify-center flex-shrink-0">
                        <Award size={14} className="text-success" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink">{cert.name}</p>
                        <p className="text-xs text-muted">{cert.issuer} · Issued {cert.issued} · Expires {cert.expiry}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Promotion History */}
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-ink mb-3">Promotion History</h3>
                <div className="space-y-3">
                  {emp.promotions.map((p, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-ink">
                          <span className="font-medium">{p.from}</span>
                          <span className="text-muted mx-2">→</span>
                          <span className="font-semibold text-accent">{p.to}</span>
                        </p>
                        <p className="text-xs text-muted">
                          {new Date(p.date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {/* Leave Balance */}
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-ink mb-3">Leave Balance</h3>
                <div className="space-y-2.5">
                  {[
                    { label: "Sick Leave", value: emp.leaveBalance.sick, color: "text-danger", bar: "bg-danger" },
                    { label: "Casual Leave", value: emp.leaveBalance.casual, color: "text-warning", bar: "bg-warning" },
                    { label: "Earned Leave", value: emp.leaveBalance.earned, color: "text-success", bar: "bg-success" },
                  ].map((lb) => (
                    <div key={lb.label}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-muted">{lb.label}</p>
                        <p className={clsx("text-xs font-bold", lb.color)}>{lb.value} days</p>
                      </div>
                      <div className="progress-track">
                        <div className={clsx("progress-fill", lb.bar)} style={{ width: `${(lb.value / 15) * 100}%`, background: undefined }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-1.5">
                  <AlertCircle size={14} className="text-danger" />
                  Emergency Contact
                </h3>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-ink">{emp.emergencyContact.name}</p>
                  <p className="text-xs text-muted">{emp.emergencyContact.relation}</p>
                  <p className="flex items-center gap-1.5 text-xs text-muted">
                    <Phone size={11} /> {emp.emergencyContact.phone}
                  </p>
                </div>
              </div>

              {/* Security */}
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-1.5">
                  <Shield size={14} className="text-success" />
                  Security
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted">2FA Status</p>
                    <span className="badge badge-green flex items-center gap-1">
                      <CheckCircle2 size={10} />
                      Enabled
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted">Active Sessions</p>
                    <span className="badge badge-blue">2 devices</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "Documents" && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink mb-4">Documents</h3>
            <div className="space-y-2">
              {emp.documents.map((doc, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-surface transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center flex-shrink-0">
                    <FileText size={14} className="text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink">{doc.name}</p>
                    <p className="text-xs text-muted">{doc.category.replace("_", " ")} · {new Date(doc.date).toLocaleDateString("en-IN")}</p>
                  </div>
                  <button className="btn btn-ghost btn-sm">Download</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "Equipment" && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink mb-4">Issued Equipment</h3>
            <div className="space-y-2">
              {emp.equipment.map((eq, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-surface transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center flex-shrink-0">
                    <Monitor size={14} className="text-muted" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink">{eq.item}</p>
                    <p className="text-xs text-muted">S/N: {eq.serial} · Issued {new Date(eq.issued).toLocaleDateString("en-IN")}</p>
                  </div>
                  <span className="badge badge-green">In Use</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(tab === "Tasks" || tab === "Salary" || tab === "History") && (
          <div className="card p-10 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center mb-3">
              <Clock size={20} className="text-muted" />
            </div>
            <p className="text-sm font-semibold text-ink">{tab} coming in Phase 2</p>
            <p className="text-xs text-muted mt-1">
              {tab === "Salary" ? "Salary details are role-gated — Super Admin & Finance only." : `${tab} data will be wired to the API in Phase 2.`}
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
