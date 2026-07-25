"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Search,
  LogOut,
  Settings,
  User,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import { api, clearAccessToken } from "@/lib/api";

interface Profile {
  id: string;
  fullName: string;
  displayName: string | null;
  role: { name: string };
  department: { name: string } | null;
  avatarUrl: string | null;
}

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "badge-purple",
  COMPANY_ADMIN: "badge-indigo",
  HR_MANAGER: "badge-pink",
  PROJECT_MANAGER: "badge-green",
  TEAM_LEAD: "badge-teal",
  DEVELOPER: "badge-blue",
  UI_UX_DESIGNER: "badge-purple",
  MOBILE_DEVELOPER: "badge-teal",
  QA_ENGINEER: "badge-yellow",
  SALES_EXECUTIVE: "badge-red",
  BUSINESS_DEVELOPMENT: "badge-purple",
  FINANCE: "badge-yellow",
  INTERN: "badge-gray",
  CLIENT: "badge-green",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function formatRoleName(role: string) {
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Mock notifications for now — will be wired to real API in Phase 7
const MOCK_NOTIFS = [
  { id: "1", type: "task", title: "New task assigned", body: "Homepage redesign has been assigned to you.", time: "5 min ago", read: false },
  { id: "2", type: "points", title: "+10 points earned", body: "You completed a task before the deadline!", time: "1 hr ago", read: false },
  { id: "3", type: "meeting", title: "Meeting in 30 minutes", body: "Sprint planning call at 11:00 AM.", time: "2 hrs ago", read: true },
];

interface TopbarProps {
  profile: Profile | null;
}

export default function Topbar({ profile }: TopbarProps) {
  const router = useRouter();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const notifsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = MOCK_NOTIFS.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleLogout() {
    try { await api.logout(); } catch {}
    clearAccessToken();
    router.replace("/");
  }

  const displayName = profile?.displayName ?? profile?.fullName ?? "Loading…";
  const roleName = profile?.role.name ?? "";

  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-white border-b border-border px-6"
      style={{ height: "var(--topbar-height)" }}
    >
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          type="text"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          placeholder="Search tasks, projects, people…"
          className="w-full pl-9 pr-4 py-2 text-sm bg-surface border border-border rounded-lg outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all placeholder:text-muted"
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative" ref={notifsRef}>
          <button
            id="topbar-notifications-btn"
            onClick={() => { setShowNotifs((v) => !v); setShowProfile(false); }}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg text-muted hover:bg-surface hover:text-ink transition-colors"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 notif-dot" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-full mt-2 w-80 card animate-scale-in p-0 overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-ink">Notifications</p>
                {unreadCount > 0 && (
                  <span className="badge badge-indigo">{unreadCount} new</span>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {MOCK_NOTIFS.map((n) => (
                  <div
                    key={n.id}
                    className={clsx(
                      "flex gap-3 px-4 py-3 border-b border-border/50 hover:bg-surface transition-colors cursor-pointer",
                      !n.read && "bg-accent-light/30"
                    )}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {n.type === "task" && <CheckCircle2 size={15} className="text-success" />}
                      {n.type === "points" && <AlertCircle size={15} className="text-accent" />}
                      {n.type === "meeting" && <Info size={15} className="text-info" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-ink">{n.title}</p>
                      <p className="text-xs text-muted truncate">{n.body}</p>
                      <p className="text-[10px] text-muted/70 mt-0.5">{n.time}</p>
                    </div>
                    {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />}
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 text-center border-t border-border">
                <button className="text-xs text-accent hover:underline font-medium">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            id="topbar-profile-btn"
            onClick={() => { setShowProfile((v) => !v); setShowNotifs(false); }}
            className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-lg hover:bg-surface transition-colors"
          >
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt={displayName} className="avatar avatar-sm" />
            ) : (
              <div className="avatar avatar-sm">{profile ? getInitials(profile.fullName) : "…"}</div>
            )}
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-ink leading-tight truncate max-w-[120px]">{displayName}</p>
              <p className="text-[10px] text-muted leading-tight">{formatRoleName(roleName)}</p>
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-56 card animate-scale-in overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-border bg-surface/50">
                <p className="text-xs font-bold text-ink">{displayName}</p>
                <p className="text-[10px] text-muted">{profile?.department?.name ?? "No Department"}</p>
                <span className={clsx("badge mt-1.5", ROLE_COLORS[roleName] ?? "badge-gray")}>
                  {formatRoleName(roleName)}
                </span>
              </div>
              <div className="py-1">
                <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-ink hover:bg-surface transition-colors">
                  <User size={14} className="text-muted" />
                  My Profile
                </button>
                <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-ink hover:bg-surface transition-colors">
                  <Settings size={14} className="text-muted" />
                  Settings
                </button>
              </div>
              <div className="py-1 border-t border-border">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-danger hover:bg-danger-light transition-colors"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
