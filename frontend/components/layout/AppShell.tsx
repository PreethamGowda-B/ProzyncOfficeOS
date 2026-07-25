"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, api } from "@/lib/api";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface Profile {
  id: string;
  fullName: string;
  displayName: string | null;
  role: { name: string };
  department: { name: string } | null;
  avatarUrl: string | null;
}

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!getAccessToken()) {
      router.replace("/");
      return;
    }
    try {
      const data = await api.me();
      setProfile(data);
    } catch {
      router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar profile={profile} />
        <main className="flex-1 p-6 overflow-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
