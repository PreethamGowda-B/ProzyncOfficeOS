"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { User, ShieldCheck, Bell, Building2, Save, Check } from "lucide-react";
import { clsx } from "clsx";

export default function SettingsPage() {
  const [me, setMe] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"profile" | "notifications" | "account">("profile");

  useEffect(() => {
    api.me().then((user) => {
      setMe(user);
      setDisplayName(user.displayName ?? "");
      setPhone(user.phone ?? "");
      setBio(user.profile?.bio ?? "");
    }).catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!me) return;
    setSaving(true);
    setSaved(false);
    try {
      await api.employees.update(me.id, { displayName, phone, bio });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { key: "profile", label: "Profile", icon: User },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "account", label: "Account", icon: Building2 },
  ];

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Settings</h1>
        <p className="text-sm text-muted mt-0.5">Manage your account preferences, profile, and notifications.</p>
      </div>

      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={clsx(
                "flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-all",
                tab === t.key ? "border-accent text-accent" : "border-transparent text-muted hover:text-ink"
              )}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-ink mb-5">Personal Information</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-xs font-semibold">Full Name</label>
                  <input
                    type="text"
                    value={me?.fullName ?? ""}
                    disabled
                    className="form-input text-xs bg-slate-50 text-muted cursor-not-allowed"
                  />
                  <p className="text-[10px] text-muted mt-1">Contact HR to update your legal name.</p>
                </div>
                <div>
                  <label className="form-label text-xs font-semibold">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="How should we call you?"
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-xs font-semibold">Work Email</label>
                  <input
                    type="email"
                    value={me?.email ?? ""}
                    disabled
                    className="form-input text-xs bg-slate-50 text-muted cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="form-label text-xs font-semibold">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="form-label text-xs font-semibold">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write a short bio about yourself..."
                  className="form-input text-xs h-24"
                />
              </div>

              {saved && (
                <div className="flex items-center gap-2 bg-success-light text-success border border-success/20 p-3 rounded-lg">
                  <Check size={15} />
                  <span className="text-xs font-semibold">Profile updated successfully!</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button type="submit" disabled={saving || !me} className="btn btn-primary gap-1.5">
                  <Save size={14} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>

          <div className="card p-5 h-fit">
            <h3 className="text-sm font-semibold text-ink mb-3">Account Summary</h3>
            {me && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Role</span>
                  <span className="font-semibold text-ink badge badge-indigo">{me.role?.name?.replace(/_/g, " ")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Department</span>
                  <span className="font-semibold text-ink">{me.department?.name ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Status</span>
                  <span className={clsx("badge", me.status === "ACTIVE" ? "badge-green" : "badge-gray")}>{me.status?.toLowerCase()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Joined</span>
                  <span className="font-semibold text-ink">{me.joiningDate ? new Date(me.joiningDate).toLocaleDateString() : "—"}</span>
                </div>
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-border">
              <a href="/settings/security" className="flex items-center gap-2 text-xs font-semibold text-accent hover:underline">
                <ShieldCheck size={14} />
                Security Settings →
              </a>
            </div>
          </div>
        </div>
      )}

      {tab === "notifications" && (
        <div className="card p-6 max-w-lg">
          <h3 className="text-sm font-semibold text-ink mb-5">Notification Preferences</h3>
          <div className="space-y-4">
            {[
              { label: "Task assignments", desc: "When a task is assigned to you" },
              { label: "Leave approvals", desc: "When your leave is approved or rejected" },
              { label: "Project updates", desc: "When a project milestone is reached" },
              { label: "New announcements", desc: "Company-wide notifications" },
              { label: "Chat messages", desc: "Unread DMs and channel messages" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">{item.label}</p>
                  <p className="text-xs text-muted">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-accent after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "account" && (
        <div className="card p-6 max-w-lg">
          <h3 className="text-sm font-semibold text-ink mb-5">Account Management</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-border bg-white">
              <p className="text-sm font-semibold text-ink">Company</p>
              <p className="text-xs text-muted mt-1">Prozync Innovations</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-white">
              <p className="text-sm font-semibold text-ink">Theme</p>
              <p className="text-xs text-muted mt-1">Light mode (dark mode coming soon)</p>
            </div>
            <div className="p-4 rounded-lg border border-danger/20 bg-danger-light/30">
              <p className="text-sm font-semibold text-danger">Danger Zone</p>
              <p className="text-xs text-muted mt-1">Contact your HR manager or Super Admin to deactivate your account.</p>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
