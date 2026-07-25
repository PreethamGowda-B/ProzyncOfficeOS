"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { Calendar, Plus, Video, Users, Clock } from "lucide-react";
import { clsx } from "clsx";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState(30);
  const [meetingLink, setMeetingLink] = useState("");
  const [attendeeIds, setAttendeeIds] = useState<string[]>([]);

  const loadData = async () => {
    try {
      const [mtgList, empList] = await Promise.all([
        api.meetings.upcoming(),
        api.employees.list(),
      ]);
      setMeetings(mtgList);
      setEmployees(empList);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !scheduledAt) return;
    setLoading(true);
    try {
      await api.meetings.create({
        title,
        scheduledAt: new Date(scheduledAt).toISOString(),
        durationMinutes: Number(duration),
        meetingLink: meetingLink || undefined,
        attendeeIds: attendeeIds.length > 0 ? attendeeIds : undefined,
      });
      setTitle("");
      setScheduledAt("");
      setMeetingLink("");
      setAttendeeIds([]);
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendee = (id: string) => {
    setAttendeeIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  // Group meetings by date
  const grouped: Record<string, any[]> = {};
  meetings.forEach((m) => {
    const dateKey = m.scheduledAt
      ? new Date(m.scheduledAt).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })
      : "Unscheduled";
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(m);
  });

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink font-display">Meetings</h1>
          <p className="text-sm text-muted mt-0.5">Schedule team calls, client demos, and one-on-ones.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary gap-1.5">
          <Plus size={14} />
          Schedule Meeting
        </button>
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([date, dayMeetings]) => (
          <div key={date}>
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">{date}</h3>
            <div className="space-y-3">
              {dayMeetings.map((m: any) => {
                const time = m.scheduledAt
                  ? new Date(m.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                  : "TBD";
                return (
                  <div key={m.id} className="card p-4 hover:border-accent/30 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Calendar size={18} className="text-accent" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-sm text-ink">{m.title}</h4>
                          {m.meetingLink && (
                            <a
                              href={m.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-secondary btn-sm gap-1.5"
                            >
                              <Video size={12} />
                              Join
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted">
                          <span className="flex items-center gap-1"><Clock size={11} /> {time} · {m.durationMinutes ?? 30} min</span>
                          <span className="flex items-center gap-1"><Users size={11} /> {m.attendees?.length ?? 0} attendees</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {meetings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center card">
            <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center mb-4">
              <Calendar size={24} className="text-muted" />
            </div>
            <p className="text-sm font-semibold text-ink">No upcoming meetings</p>
            <p className="text-xs text-muted mt-1">Schedule a meeting to get started.</p>
            <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm mt-4 gap-1.5">
              <Plus size={13} /> Schedule Now
            </button>
          </div>
        )}
      </div>

      {/* Create Meeting Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-lg p-6 bg-white space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold text-base text-ink">Schedule a Meeting</h3>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="form-label text-xs font-semibold">Meeting Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sprint Planning · Q3 Client Demo"
                  className="form-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-xs font-semibold">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>
                <div>
                  <label className="form-label text-xs font-semibold">Duration (mins)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    placeholder="30"
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="form-label text-xs font-semibold">Meeting Link (optional)</label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="form-label text-xs font-semibold">Attendees</label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto border border-border rounded-lg p-2 bg-white">
                  {employees.map((emp) => (
                    <label key={emp.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-surface rounded">
                      <input
                        type="checkbox"
                        checked={attendeeIds.includes(emp.id)}
                        onChange={() => toggleAttendee(emp.id)}
                        className="rounded"
                      />
                      <span className="text-xs font-medium text-ink">{emp.fullName}</span>
                      <span className="text-[10px] text-muted">{emp.role?.name?.replace(/_/g, " ")}</span>
                    </label>
                  ))}
                  {employees.length === 0 && <p className="text-xs text-muted px-2">No employees found.</p>}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" disabled={loading} className="btn btn-primary btn-sm">
                  {loading ? "Scheduling..." : "Schedule Meeting"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
