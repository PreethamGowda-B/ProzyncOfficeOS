"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { GitBranch, GitPullRequest, ExternalLink, Loader, AlertCircle } from "lucide-react";
import { clsx } from "clsx";

export default function GitHubPage() {
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"}/github/repos`, {
      headers: {
        Authorization: `Bearer ${typeof window !== "undefined" ? sessionStorage.getItem("officeos_at") ?? "" : ""}`,
      },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRepos(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink font-display">GitHub Sync</h1>
          <p className="text-sm text-muted mt-0.5">Linked organization repositories, deployment logs, and review check statuses.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size={20} className="text-muted animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Linked Repos */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-1.5">
              <GitBranch size={16} className="text-indigo-500" /> Linked Repositories
            </h3>
            <div className="space-y-3">
              {repos.length > 0 ? repos.map((repo: any) => (
                <div key={repo.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-white hover:border-accent/30 transition-all">
                  <div>
                    <p className="text-sm font-semibold text-ink">{repo.fullName}</p>
                    <p className="text-xs text-muted">Default branch: {repo.defaultBranch ?? "main"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-green text-[10px]">active</span>
                    {repo.htmlUrl && (
                      <a href={repo.htmlUrl} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent transition-colors">
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle size={20} className="text-muted mb-2" />
                  <p className="text-xs text-muted font-semibold">No repositories linked yet</p>
                  <p className="text-[11px] text-muted mt-1">Link a GitHub repo from your project settings.</p>
                </div>
              )}
            </div>
          </div>

          {/* Open PRs */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-1.5">
              <GitPullRequest size={16} className="text-purple-500" /> Open Pull Requests
            </h3>
            <div className="space-y-3">
              {repos.flatMap((r: any) => r.pullRequests ?? []).length > 0 ? (
                repos.flatMap((r: any) => r.pullRequests ?? []).map((pr: any) => (
                  <div key={pr.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-white">
                    <div>
                      <p className="text-sm font-semibold text-ink">#{pr.githubPrNumber}: {pr.title}</p>
                      <p className="text-xs text-muted">Branch: {pr.sourceBranch} → {pr.targetBranch}</p>
                    </div>
                    <span className={clsx("badge text-[10px]",
                      pr.state === "MERGED" ? "badge-purple" :
                      pr.state === "CLOSED" ? "badge-gray" : "badge-green"
                    )}>
                      {pr.state?.toLowerCase() ?? "open"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <GitPullRequest size={20} className="text-muted mb-2" />
                  <p className="text-xs text-muted font-semibold">No pull requests tracked yet</p>
                  <p className="text-[11px] text-muted mt-1">Configure the GitHub webhook to sync PRs automatically.</p>
                </div>
              )}
            </div>
          </div>

          {/* Webhook setup guide */}
          <div className="card p-5 md:col-span-2">
            <h3 className="text-sm font-semibold text-ink mb-2">GitHub Webhook Setup</h3>
            <p className="text-xs text-muted mb-3">To sync pull requests and deployment events automatically, add this webhook URL to your GitHub organization:</p>
            <div className="bg-slate-900 text-slate-200 text-xs font-mono p-3 rounded-lg">
              POST https://your-api-domain/api/github/webhook
            </div>
            <p className="text-[11px] text-muted mt-2">Set the secret to your <code className="text-accent bg-accent/10 px-1 rounded">GITHUB_WEBHOOK_SECRET</code> environment variable value.</p>
          </div>
        </div>
      )}
    </AppShell>
  );
}
