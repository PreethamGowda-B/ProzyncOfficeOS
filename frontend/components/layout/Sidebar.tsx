"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  ClipboardList,
  Users,
  Megaphone,
  TrendingUp,
  BookOpen,
  GitBranch,
  DollarSign,
  UserCheck,
  MessageSquare,
  BarChart3,
  Sparkles,
  Settings,
  ChevronLeft,
  Building2,
  ShieldCheck,
  Briefcase,
  Video,
  Trophy,
} from "lucide-react";
import { clsx } from "clsx";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavSection {
  section: string;
  items: NavItem[];
}

const NAV: NavSection[] = [
  {
    section: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
      { label: "Meetings", href: "/meetings", icon: Video },
    ],
  },
  {
    section: "Work",
    items: [
      { label: "Projects", href: "/projects", icon: FolderKanban },
      { label: "Tasks", href: "/tasks", icon: CheckSquare },
      { label: "Daily Update", href: "/daily-update", icon: ClipboardList },
    ],
  },
  {
    section: "People",
    items: [
      { label: "Employees", href: "/employees", icon: Users },
      { label: "Recruitment", href: "/recruitment", icon: Briefcase },
      { label: "HR", href: "/hr", icon: UserCheck },
    ],
  },
  {
    section: "Business",
    items: [
      { label: "CRM", href: "/crm", icon: TrendingUp },
      { label: "Finance", href: "/finance", icon: DollarSign },
      { label: "Client Portal", href: "/portal", icon: Building2 },
    ],
  },
  {
    section: "Tools",
    items: [
      { label: "GitHub", href: "/github", icon: GitBranch },
      { label: "Knowledge Base", href: "/kb", icon: BookOpen },
      { label: "Chat", href: "/chat", icon: MessageSquare },
      { label: "Announcements", href: "/announcements", icon: Megaphone },
    ],
  },
  {
    section: "Admin",
    items: [
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "AI Assistant", href: "/ai", icon: Sparkles },
      { label: "Security", href: "/settings/security", icon: ShieldCheck },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={clsx(
        "sidebar flex flex-col relative transition-all duration-300 z-20",
        collapsed ? "w-16" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold font-display">P</span>
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <p className="font-display text-white text-sm font-semibold leading-tight">Prozync</p>
            <p className="text-white/30 text-[10px] leading-tight">OfficeOS</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5 scrollbar-hide">
        {NAV.map(({ section, items }) => (
          <div key={section}>
            {!collapsed && (
              <p className="sidebar-section-label">{section}</p>
            )}
            {collapsed && <div className="h-3" />}
            {items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-tooltip={collapsed ? item.label : undefined}
                  className={clsx("sidebar-item group relative", isActive && "active")}
                >
                  <item.icon
                    size={16}
                    className={clsx(
                      "sidebar-icon flex-shrink-0 transition-colors",
                      isActive ? "text-indigo-400" : "text-white/40 group-hover:text-white/70"
                    )}
                  />
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                  {item.badge && item.badge > 0 && !collapsed && (
                    <span className="ml-auto bg-accent text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center w-full py-3 border-t border-white/5 text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronLeft
          size={16}
          className={clsx("transition-transform duration-300", collapsed && "rotate-180")}
        />
      </button>
    </aside>
  );
}
