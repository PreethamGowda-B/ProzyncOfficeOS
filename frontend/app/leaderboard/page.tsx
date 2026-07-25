"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { Trophy, Zap, ChevronUp, ChevronDown, Search, Loader } from "lucide-react";
import { clsx } from "clsx";

function getInitials(name: string) {
  return (name ?? "U").split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

const GRADIENTS = [
  "from-yellow-400 to-amber-500",
  "from-slate-400 to-slate-500",
  "from-amber-600 to-amber-800",
  "from-indigo-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-sky-500 to-blue-600",
];

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [myScore, setMyScore] = useState<any>({ thisMonth: 0, totalAllTime: 0 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const now = new Date();

  useEffect(() => {
    const load = async () => {
      try {
        const [lbData, score] = await Promise.all([
          api.points.leaderboard(now.getFullYear(), now.getMonth() + 1),
          api.points.myScore().catch(() => ({ thisMonth: 0, totalAllTime: 0 })),
        ]);
        setLeaderboard(lbData);
        setMyScore(score);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = leaderboard.filter((e) =>
    (e.fullName ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (e.role?.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const podium = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  const monthLabel = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Leaderboard</h1>
          <p className="text-sm text-muted mt-0.5">Top performers for {monthLabel} — ranked by task completions, bug fixes, and daily updates.</p>
        </div>
        <div className="card p-2.5 px-4 border border-yellow-200 bg-yellow-50 flex items-center gap-2">
          <Zap size={14} className="text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-bold text-yellow-900">Your score: {myScore.thisMonth} pts</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size={20} className="text-muted animate-spin" />
        </div>
      ) : (
        <>
          {/* Podium for top 3 */}
          {podium.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 items-end max-w-4xl mx-auto pt-6">
              {/* Rank 2 */}
              {podium[1] && (
                <div className="card p-5 flex flex-col items-center justify-center text-center order-2 md:order-1 h-[220px] relative border-t-4 border-slate-300">
                  <span className="absolute -top-3.5 bg-slate-300 text-slate-800 text-[10px] font-bold rounded-full w-7 h-7 flex items-center justify-center border-2 border-white">2</span>
                  <div className={clsx("avatar avatar-lg bg-gradient-to-br mb-2", GRADIENTS[1])}>
                    {getInitials(podium[1].fullName)}
                  </div>
                  <p className="font-semibold text-sm text-ink">{podium[1].fullName}</p>
                  <p className="text-xs text-muted">{podium[1].role?.name?.replace(/_/g, " ")}</p>
                  <p className="text-base font-bold text-accent mt-2 flex items-center gap-1">
                    <Zap size={14} className="fill-accent text-accent" />
                    {podium[1].totalPoints ?? 0} pts
                  </p>
                </div>
              )}

              {/* Rank 1 */}
              {podium[0] && (
                <div className="card p-6 flex flex-col items-center justify-center text-center order-1 md:order-2 h-[260px] relative border-t-4 border-yellow-400 shadow-lg">
                  <span className="absolute -top-4 bg-yellow-400 text-yellow-950 text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center border-2 border-white">1</span>
                  <Trophy className="text-yellow-500 mb-2" size={28} />
                  <div className={clsx("avatar avatar-xl bg-gradient-to-br mb-2", GRADIENTS[0])}>
                    {getInitials(podium[0].fullName)}
                  </div>
                  <p className="font-semibold text-base text-ink">{podium[0].fullName}</p>
                  <p className="text-xs text-muted">{podium[0].role?.name?.replace(/_/g, " ")}</p>
                  <p className="text-lg font-bold text-yellow-600 mt-2 flex items-center gap-1">
                    <Zap size={16} className="fill-yellow-500 text-yellow-500" />
                    {podium[0].totalPoints ?? 0} pts
                  </p>
                </div>
              )}

              {/* Rank 3 */}
              {podium[2] && (
                <div className="card p-5 flex flex-col items-center justify-center text-center order-3 h-[200px] relative border-t-4 border-amber-600">
                  <span className="absolute -top-3.5 bg-amber-600 text-white text-[10px] font-bold rounded-full w-7 h-7 flex items-center justify-center border-2 border-white">3</span>
                  <div className={clsx("avatar avatar-lg bg-gradient-to-br mb-2", GRADIENTS[2])}>
                    {getInitials(podium[2].fullName)}
                  </div>
                  <p className="font-semibold text-sm text-ink">{podium[2].fullName}</p>
                  <p className="text-xs text-muted">{podium[2].role?.name?.replace(/_/g, " ")}</p>
                  <p className="text-base font-bold text-accent mt-2 flex items-center gap-1">
                    <Zap size={14} className="fill-accent text-accent" />
                    {podium[2].totalPoints ?? 0} pts
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Search */}
          <div className="relative max-w-sm mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leaderboard..."
              className="form-input pl-9"
            />
          </div>

          {/* Rest of table */}
          {rest.length > 0 ? (
            <div className="card overflow-hidden p-0">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="w-16">Rank</th>
                    <th>Employee</th>
                    <th>Role</th>
                    <th>Score</th>
                    <th className="w-20">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {rest.map((e: any, idx: number) => (
                    <tr key={e.id ?? idx}>
                      <td className="font-semibold text-muted">#{idx + 4}</td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className={clsx("avatar avatar-sm bg-gradient-to-br", GRADIENTS[(idx + 3) % GRADIENTS.length])}>
                            {getInitials(e.fullName)}
                          </div>
                          <span className="font-medium text-ink">{e.fullName}</span>
                        </div>
                      </td>
                      <td className="text-sm text-muted">{e.role?.name?.replace(/_/g, " ")}</td>
                      <td className="font-bold text-ink">{e.totalPoints ?? 0} pts</td>
                      <td>
                        <ChevronUp className="text-success" size={16} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card p-10 text-center">
              <Trophy size={32} className="text-muted mx-auto mb-3" />
              <p className="text-sm font-semibold text-ink">No scores yet this month</p>
              <p className="text-xs text-muted mt-1">Submit daily updates and complete tasks to start earning points!</p>
            </div>
          ) : null}
        </>
      )}
    </AppShell>
  );
}
