"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { Megaphone, Plus, Calendar, Building2 } from "lucide-react";
import { clsx } from "clsx";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [me, setMe] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("company");

  const loadData = async () => {
    try {
      const [annList, user] = await Promise.all([
        api.announcements.list(),
        api.me(),
      ]);
      setAnnouncements(annList);
      setMe(user);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;
    setLoading(true);
    try {
      await api.announcements.create({ title, body, audience });
      setTitle("");
      setBody("");
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const canPost = me && ["SUPER_ADMIN", "COMPANY_ADMIN", "HR_MANAGER"].includes(me.role?.name);

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink font-display">Announcements</h1>
          <p className="text-sm text-muted mt-0.5">Official company-wide updates, policy reviews, and scheduling events.</p>
        </div>
        {canPost && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary gap-1.5">
            <Plus size={14} />
            New Announcement
          </button>
        )}
      </div>

      <div className="space-y-4 max-w-3xl">
        {announcements.map((ann) => (
          <div key={ann.id} className="card p-5 border-l-4 border-accent hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Megaphone size={15} className="text-accent" />
                </div>
                <h3 className="font-semibold text-base text-ink leading-tight">{ann.title}</h3>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={clsx("badge text-[10px]", ann.audience === "company" ? "badge-indigo" : "badge-purple")}>
                  {ann.audience}
                </span>
                <span className="text-xs text-muted flex items-center gap-1">
                  <Calendar size={11} />
                  {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted leading-relaxed ml-11">{ann.body}</p>
            {ann.postedBy && (
              <p className="text-xs text-muted mt-3 ml-11 flex items-center gap-1">
                <Building2 size={11} />
                Posted by {ann.postedBy.fullName}
              </p>
            )}
          </div>
        ))}

        {announcements.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center card">
            <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center mb-4">
              <Megaphone size={22} className="text-muted" />
            </div>
            <p className="text-sm font-semibold text-ink">No announcements yet</p>
            <p className="text-xs text-muted mt-1">Check back later or ask your HR manager to post an update.</p>
          </div>
        )}
      </div>

      {/* Create Announcement Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-lg p-6 bg-white space-y-4">
            <h3 className="font-semibold text-base text-ink">Create Announcement</h3>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="form-label text-xs font-semibold">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q3 All-Hands Meeting — Friday 3PM"
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="form-label text-xs font-semibold">Message</label>
                <textarea
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write the announcement message..."
                  className="form-input text-xs h-28"
                />
              </div>

              <div>
                <label className="form-label text-xs font-semibold">Audience</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="form-input text-xs"
                >
                  <option value="company">Entire Company</option>
                  <option value="engineering">Engineering Team</option>
                  <option value="hr">HR Team</option>
                  <option value="sales">Sales Team</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" disabled={loading} className="btn btn-primary btn-sm">
                  {loading ? "Posting..." : "Post Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
