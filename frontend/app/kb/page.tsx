"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { BookOpen, Search, Folder, Video, FileText, Plus } from "lucide-react";
import { clsx } from "clsx";

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [category, setCategory] = useState<string>("");
  const [search, setSearch] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [artCategory, setArtCategory] = useState("SOPs");
  const [content, setContent] = useState("");

  const loadData = async () => {
    try {
      const data = await api.kb.articles.list(category || undefined, search || undefined);
      setArticles(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [category, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setLoading(true);
    try {
      await api.kb.articles.create({
        title,
        category: artCategory,
        content,
      });
      setTitle("");
      setContent("");
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink font-display">Knowledge Base</h1>
          <p className="text-sm text-muted mt-0.5">Access company SOPs, coding standards, design rules, and training materials.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary gap-1.5">
          <Plus size={14} />
          Add Article
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div onClick={() => setCategory("SOPs")} className={clsx("card p-5 cursor-pointer transition-colors", category === "SOPs" ? "border-accent bg-accent/5" : "hover:border-accent/40")}>
          <Folder className="text-accent mb-2" size={24} />
          <h3 className="font-semibold text-sm text-ink">Company SOPs</h3>
          <p className="text-[11px] text-muted mt-1">General company procedures and guidelines.</p>
        </div>
        <div onClick={() => setCategory("Standards")} className={clsx("card p-5 cursor-pointer transition-colors", category === "Standards" ? "border-emerald-500 bg-emerald-50/10" : "hover:border-accent/40")}>
          <BookOpen className="text-emerald-500 mb-2" size={24} />
          <h3 className="font-semibold text-sm text-ink">Coding Standards</h3>
          <p className="text-[11px] text-muted mt-1">Directives for styling and structuring git repos.</p>
        </div>
        <div onClick={() => setCategory("APIs")} className={clsx("card p-5 cursor-pointer transition-colors", category === "APIs" ? "border-amber-500 bg-amber-50/10" : "hover:border-accent/40")}>
          <FileText className="text-amber-500 mb-2" size={24} />
          <h3 className="font-semibold text-sm text-ink">API Documentation</h3>
          <p className="text-[11px] text-muted mt-1">Endpoints registers and schema designs.</p>
        </div>
        <div onClick={() => setCategory("")} className={clsx("card p-5 cursor-pointer transition-colors", category === "" ? "border-indigo-500 bg-indigo-50/10" : "hover:border-accent/40")}>
          <Video className="text-indigo-500 mb-2" size={24} />
          <h3 className="font-semibold text-sm text-ink">Clear Filters</h3>
          <p className="text-[11px] text-muted mt-1">Show all resource articles.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              placeholder="Search documentation catalog..."
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-9"
            />
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink mb-4">Documentation Catalog</h3>
            <div className="space-y-3">
              {articles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => setSelectedArticle(art)}
                  className={clsx("p-3 rounded-lg border cursor-pointer hover:bg-surface transition-all bg-white", selectedArticle?.id === art.id ? "border-accent" : "border-border")}
                >
                  <p className="text-xs font-bold text-accent uppercase tracking-wide">{art.category}</p>
                  <p className="text-sm font-semibold text-ink mt-0.5">{art.title}</p>
                </div>
              ))}
              {articles.length === 0 && <p className="text-xs text-muted">No documents found.</p>}
            </div>
          </div>
        </div>

        {/* View Document Sidebar */}
        <div>
          {selectedArticle ? (
            <div className="card p-5 space-y-4 bg-white">
              <div>
                <span className="text-[10px] text-accent font-bold uppercase">{selectedArticle.category}</span>
                <h3 className="font-semibold text-base text-ink mt-0.5">{selectedArticle.title}</h3>
              </div>
              <p className="text-xs text-muted leading-relaxed whitespace-pre-wrap">{selectedArticle.content}</p>
            </div>
          ) : (
            <div className="card p-5 text-center py-10 bg-slate-50 border-dashed">
              <BookOpen className="text-slate-300 mx-auto mb-2" size={24} />
              <p className="text-xs text-muted">Select an article from the catalog list to view its full content.</p>
            </div>
          )}
        </div>
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6 bg-white space-y-4">
            <h3 className="font-semibold text-base text-ink">Add SOP Document</h3>
            
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="form-label text-xs font-semibold">Article Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Git flow branch directives"
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="form-label text-xs font-semibold">Category</label>
                <select
                  value={artCategory}
                  onChange={(e) => setArtCategory(e.target.value)}
                  className="form-input text-xs"
                >
                  <option value="SOPs">SOPs</option>
                  <option value="Standards">Standards</option>
                  <option value="APIs">APIs</option>
                </select>
              </div>

              <div>
                <label className="form-label text-xs font-semibold">Document Content</label>
                <textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste details markdown or plain text..."
                  className="form-input text-xs h-32"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" disabled={loading} className="btn btn-primary btn-sm">{loading ? "Saving..." : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
