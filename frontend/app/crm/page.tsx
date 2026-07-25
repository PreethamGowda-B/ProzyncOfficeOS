"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { Plus, Search, User, Mail, Phone, Globe, Briefcase } from "lucide-react";
import { clsx } from "clsx";

const COLUMNS = [
  { key: "PROSPECTING", label: "Prospecting", bg: "bg-slate-50 border-slate-200" },
  { key: "PROPOSAL_SENT", label: "Proposal Sent", bg: "bg-blue-50/50 border-blue-100" },
  { key: "NEGOTIATION", label: "Negotiation", bg: "bg-amber-50/50 border-amber-100" },
  { key: "WON", label: "Won", bg: "bg-emerald-50/50 border-emerald-100" },
  { key: "LOST", label: "Lost", bg: "bg-rose-50/50 border-rose-100" },
];

const LEAD_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "DISQUALIFIED", "CONVERTED"];

export default function CrmPage() {
  const [tab, setTab] = useState<"deals" | "leads">("deals");
  const [deals, setDeals] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  
  // Deal Modal
  const [showDealModal, setShowDealModal] = useState(false);
  const [dealTitle, setDealTitle] = useState("");
  const [dealValue, setDealValue] = useState(0);
  const [associatedLeadId, setAssociatedLeadId] = useState("");
  
  // Lead Modal
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadContactName, setLeadContactName] = useState("");
  const [leadCompanyName, setLeadCompanyName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadSource, setLeadSource] = useState("website");

  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [dealList, leadList] = await Promise.all([
        api.crm.deals.list(),
        api.crm.leads.list(),
      ]);
      setDeals(dealList);
      setLeads(leadList);
      if (leadList.length > 0 && !associatedLeadId) {
        setAssociatedLeadId(leadList[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealTitle) return;

    setLoading(true);
    try {
      await api.crm.deals.create({
        title: dealTitle,
        value: dealValue ? Number(dealValue) : undefined,
        leadId: associatedLeadId || undefined,
      });
      setDealTitle("");
      setDealValue(0);
      setShowDealModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadContactName) return;

    setLoading(true);
    try {
      await api.crm.leads.create({
        contactName: leadContactName,
        companyName: leadCompanyName || undefined,
        email: leadEmail || undefined,
        phone: leadPhone || undefined,
        source: leadSource || undefined,
      });
      setLeadContactName("");
      setLeadCompanyName("");
      setLeadEmail("");
      setLeadPhone("");
      setLeadSource("website");
      setShowLeadModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDealStageChange = async (dealId: string, newStage: string) => {
    try {
      await api.crm.deals.updateStage(dealId, newStage);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeadStatusChange = async (leadId: string, newStatus: string) => {
    try {
      await api.crm.leads.updateStatus(leadId, newStatus);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDeals = deals.filter((d) =>
    d.title?.toLowerCase().includes(search.toLowerCase()) ||
    d.lead?.companyName?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredLeads = leads.filter((l) =>
    l.contactName?.toLowerCase().includes(search.toLowerCase()) ||
    l.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    l.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink font-display">Sales CRM</h1>
          <p className="text-sm text-muted mt-0.5">Manage prospect pipelines, log interactions, and review active deal states.</p>
        </div>
        <div>
          {tab === "deals" ? (
            <button onClick={() => setShowDealModal(true)} className="btn btn-primary gap-1.5">
              <Plus size={14} />
              Create Deal
            </button>
          ) : (
            <button onClick={() => setShowLeadModal(true)} className="btn btn-primary gap-1.5">
              <Plus size={14} />
              Add Lead
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        <button
          onClick={() => { setTab("deals"); setSearch(""); }}
          className={clsx(
            "px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-all",
            tab === "deals" ? "border-accent text-accent" : "border-transparent text-muted hover:text-ink"
          )}
        >
          Deals Pipeline ({deals.length})
        </button>
        <button
          onClick={() => { setTab("leads"); setSearch(""); }}
          className={clsx(
            "px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-all",
            tab === "leads" ? "border-accent text-accent" : "border-transparent text-muted hover:text-ink"
          )}
        >
          Leads Catalog ({leads.length})
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={search}
          placeholder={tab === "deals" ? "Search deals..." : "Search leads..."}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input pl-9"
        />
      </div>

      {/* Deals tab view */}
      {tab === "deals" && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const colDeals = filteredDeals.filter((d) => d.stage === col.key);
            return (
              <div key={col.key} className={clsx("rounded-xl border p-4 flex flex-col min-h-[450px]", col.bg)}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-ink uppercase tracking-wider">{col.label}</span>
                  <span className="badge badge-gray text-[10px] font-bold">{colDeals.length}</span>
                </div>

                <div className="space-y-3">
                  {colDeals.map((d) => (
                    <div key={d.id} className="card p-4 hover:border-accent/40 cursor-pointer shadow-sm bg-white">
                      <span className="text-[10px] text-muted font-bold tracking-wide uppercase">{d.lead?.companyName ?? "Direct Client"}</span>
                      <h4 className="text-xs font-semibold text-ink mt-0.5 mb-3 leading-tight">{d.title}</h4>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                        <span className="font-bold text-accent">
                          {d.value ? `INR ${Number(d.value).toLocaleString()}` : "TBD"}
                        </span>
                        
                        <select
                          value={d.stage}
                          onChange={(e) => handleDealStageChange(d.id, e.target.value)}
                          className="text-[10px] border border-slate-200 bg-white rounded p-0.5 font-semibold text-ink"
                        >
                          {COLUMNS.map((c) => (
                            <option key={c.key} value={c.key}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                  {colDeals.length === 0 && <p className="text-[10px] text-muted text-center py-4">No deals in stage</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Leads tab view */}
      {tab === "leads" && (
        <div className="card overflow-hidden p-0 bg-white">
          <table className="data-table">
            <thead>
              <tr>
                <th>Contact info</th>
                <th>Company</th>
                <th>Source</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((l) => (
                <tr key={l.id}>
                  <td>
                    <div>
                      <p className="font-semibold text-sm text-ink">{l.contactName}</p>
                      {l.email && <p className="text-xs text-muted flex items-center gap-1 mt-0.5"><Mail size={11} /> {l.email}</p>}
                      {l.phone && <p className="text-xs text-muted flex items-center gap-1 mt-0.5"><Phone size={11} /> {l.phone}</p>}
                    </div>
                  </td>
                  <td className="text-sm font-medium text-ink">{l.companyName ?? "—"}</td>
                  <td className="text-xs text-muted uppercase font-semibold">{l.source ?? "—"}</td>
                  <td>
                    <span className={clsx("badge",
                      l.status === "NEW" ? "badge-blue" :
                      l.status === "CONTACTED" ? "badge-yellow" :
                      l.status === "QUALIFIED" ? "badge-green" :
                      l.status === "DISQUALIFIED" ? "badge-red" : "badge-purple"
                    )}>
                      {l.status?.toLowerCase()}
                    </span>
                  </td>
                  <td>
                    <select
                      value={l.status}
                      onChange={(e) => handleLeadStatusChange(l.id, e.target.value)}
                      className="text-xs border border-slate-200 bg-white rounded p-1 font-semibold text-ink"
                    >
                      {LEAD_STATUSES.map((s) => (
                        <option key={s} value={s}>{s.toLowerCase()}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-xs text-muted text-center py-4">No leads registered.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Creation Deal Modal */}
      {showDealModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6 bg-white space-y-4">
            <h3 className="font-semibold text-base text-ink">Create New CRM Deal</h3>
            
            <form onSubmit={handleCreateDeal} className="space-y-3">
              <div>
                <label className="form-label text-xs font-semibold">Deal Title</label>
                <input
                  type="text"
                  required
                  value={dealTitle}
                  onChange={(e) => setDealTitle(e.target.value)}
                  placeholder="e.g. Website development contract"
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="form-label text-xs font-semibold">Estimated Deal Value (INR)</label>
                <input
                  type="number"
                  value={dealValue}
                  onChange={(e) => setDealValue(Number(e.target.value))}
                  placeholder="50000"
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="form-label text-xs font-semibold">Associated Lead</label>
                <select
                  value={associatedLeadId}
                  onChange={(e) => setAssociatedLeadId(e.target.value)}
                  className="form-input text-xs"
                >
                  <option value="">No Associated Lead</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>{l.contactName} ({l.companyName ?? "No Company"})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button type="button" onClick={() => setShowDealModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" disabled={loading} className="btn btn-primary btn-sm">{loading ? "Saving..." : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Creation Lead Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6 bg-white space-y-4">
            <h3 className="font-semibold text-base text-ink">Add New Lead</h3>
            
            <form onSubmit={handleCreateLead} className="space-y-3">
              <div>
                <label className="form-label text-xs font-semibold">Contact Name</label>
                <input
                  type="text"
                  required
                  value={leadContactName}
                  onChange={(e) => setLeadContactName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="form-label text-xs font-semibold">Company Name</label>
                <input
                  type="text"
                  value={leadCompanyName}
                  onChange={(e) => setLeadCompanyName(e.target.value)}
                  placeholder="e.g. Acme Tech Solutions"
                  className="form-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-xs font-semibold">Email</label>
                  <input
                    type="email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="rajesh@company.com"
                    className="form-input text-xs"
                  />
                </div>
                <div>
                  <label className="form-label text-xs font-semibold">Phone</label>
                  <input
                    type="tel"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="form-label text-xs font-semibold">Source</label>
                <select
                  value={leadSource}
                  onChange={(e) => setLeadSource(e.target.value)}
                  className="form-input text-xs"
                >
                  <option value="website">Website Inquiry</option>
                  <option value="referral">Referral</option>
                  <option value="cold outreach">Cold Outreach</option>
                  <option value="linkedin">LinkedIn</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button type="button" onClick={() => setShowLeadModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" disabled={loading} className="btn btn-primary btn-sm">{loading ? "Saving..." : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
