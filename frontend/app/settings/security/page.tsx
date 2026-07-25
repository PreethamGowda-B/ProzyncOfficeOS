"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { Monitor, Smartphone, Key, Ban } from "lucide-react";

export default function SecurityPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = async () => {
    try {
      const data = await api.admin.sessions();
      setSessions(data);
    } catch {
      // Fallback if not admin
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const revokeSession = async (id: string) => {
    try {
      await api.admin.revokeSession(id);
      setSessions(sessions.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink font-display">Security Settings</h1>
          <p className="text-sm text-muted mt-0.5">Manage two-factor authentication, monitor login history, and revoke active sessions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {/* Active Sessions */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink mb-4">Active Login Sessions</h3>
            {loading ? (
              <p className="text-xs text-muted">Loading sessions...</p>
            ) : (
              <div className="space-y-3">
                {sessions.length > 0 ? sessions.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-white">
                    <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center flex-shrink-0">
                      {(s.userAgent ?? "").toLowerCase().includes("iphone") || (s.userAgent ?? "").toLowerCase().includes("mobile")
                        ? <Smartphone size={14} className="text-muted" />
                        : <Monitor size={14} className="text-muted" />
                      }
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-ink">{s.userAgent ?? "Browser Session"}</p>
                        {s.isCurrent && <span className="badge badge-green text-[9px]">current</span>}
                      </div>
                      <p className="text-xs text-muted">IP: {s.ip ?? "—"} · Last active: {s.lastActiveAt ? new Date(s.lastActiveAt).toLocaleString() : "Now"}</p>
                    </div>
                    {!s.isCurrent && (
                      <button onClick={() => revokeSession(s.id)} className="btn btn-ghost btn-sm text-danger hover:bg-danger-light gap-1">
                        <Ban size={12} /> Revoke
                      </button>
                    )}
                  </div>
                )) : (
                  <p className="text-xs text-muted">No other active sessions found. Only admins can view all sessions.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 2FA Status */}
        <div className="space-y-5">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-1.5"><Key size={15} className="text-accent" /> 2FA Verification</h3>
            <p className="text-xs text-muted mb-4">Two-factor authentication is recommended for all admins and finance coordinators.</p>
            <button className="btn btn-secondary w-full justify-center">Enable TOTP Authenticator</button>
          </div>
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink mb-3">Password</h3>
            <p className="text-xs text-muted mb-4">Change your login password. You will be logged out after changing.</p>
            <button className="btn btn-secondary w-full justify-center">Change Password</button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
