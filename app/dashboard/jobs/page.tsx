'use client';

import { useEffect, useState, useMemo } from 'react';
import Sidebar from '@/app/components/Sidebar';
import { useLanguage } from '@/context/LanguageContext';
import type { JobDTO } from '@/app/lib/types';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';





import toast from 'react-hot-toast';
import {
  ChevronDown, ChevronUp, Calendar, Search, Filter,
  Pencil, Trash2, Plus, X, Check, Archive, BriefcaseBusiness, Wrench
} from 'lucide-react';

type JobView = JobDTO & {
  customer?: { id: number; fullName: string; email: string } | null;
  assignees: Array<{ id: number; userId: number; user: { id: number; name: string } | null; roleOnJob: string | null }>;
};



const JOB_CATEGORIES = [
  'Renovation & Remodeling','New Construction','Extension & Addition',
  'Interior Design','Infrastructure','Specialised',
  'Electrical','HVAC','Plumbing','Solar & Renewables',
  'Civil Works','Demolition','Waterproofing',
];

const STATUS_OPTIONS = [
  'Pending','In Progress','Completed','Cancelled',
];

export default function JobsPage() {
  const { t } = useLanguage();
  const isEn = t('index') === 'index' || true; // fallback

  const [jobs, setJobs] = useState<JobView[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);


  const [loading, setLoading]   = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobView | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCat, setFilterCat] = useState('all');

  // ── Form state ────────────────────────────────────────────────────────────
  const blankForm = { title: '', description: '', location: '', category: '', budget: '', deadline: '', customerId: '' };
  const [form, setForm] = useState(blankForm);

  // ── Data fetch ────────────────────────────────────────────────────────────
  const loadData = async () => {
    try {
      const [jobsRes, custRes] = await Promise.all([
        fetch('/api/jobs'),
        fetch('/api/customers'),
      ]);
      const [jobsData, custData] = await Promise.all([jobsRes.json(), custRes.json()]);
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setCustomers(Array.isArray(custData) ? custData : []);
    } catch { toast.error('Failed to load jobs'); }
    setLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, []);


  const currency = (n: number | string | null) =>
    n ? `€ ${Number(n).toLocaleString('en-IE')}` : '€ —';

  // ── Derived / filtered ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...jobs];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.location?.toLowerCase().includes(q) ||
        j.category?.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'all') {
      result = result.filter(j => j.status === filterStatus);
    }
    if (filterCat !== 'all') {
      result = result.filter(j => j.category === filterCat);
    }
    return result;
  }, [jobs, search, filterStatus, filterCat]);

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      'Pending':   'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'In Progress': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'Completed': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'Cancelled': 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return map[s] ?? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700';
  };

  // ── CRUD actions ──────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!form.title.trim()) return toast.error('Title is required');
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:        form.title,
          description:  form.description  || null,
          location:     form.location     || null,
          category:     form.category     || null,
          budget:       form.budget       ? Number(form.budget) : null,
          deadline:     form.deadline     || null,
          customerId:   form.customerId   ? Number(form.customerId) : null,
        }),
      });
      if (!res.ok) { toast.error('Failed to create job'); return; }
      toast.success('Job created');
      setIsCreateOpen(false); setForm(blankForm); loadData();
    } catch { toast.error('Network error'); }
  };

  const handleEdit = (job: JobView) => { setEditingJob(job); setForm({
    title: job.title,
    description: job.description ?? '',
    location: job.location ?? '',
    category: job.category ?? '',
    budget: job.budget ?? '',
    deadline: job.deadline ?? '',
    customerId: job.customerId?.toString() ?? '',
  }); setIsEditOpen(true); };

  const handleSaveEdit = async () => {
    if (!editingJob || !form.title.trim()) return;
    try {
      const res = await fetch(`/api/jobs/${editingJob.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:        form.title,
          description:  form.description  || null,
          location:     form.location     || null,
          category:     form.category     || null,
          budget:       form.budget       ? Number(form.budget) : null,
          deadline:     form.deadline     || null,
          customerId:   form.customerId   ? Number(form.customerId) : null,
        }),
      });
      if (!res.ok) { toast.error('Failed to update job'); return; }
      toast.success('Job updated');
      setIsEditOpen(false); setEditingJob(null); setForm(blankForm); loadData();
    } catch { toast.error('Network error'); }
  };

  const handleDelete = async (job: JobView) => {
    if (!confirm(`Delete "${job.title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/jobs/${job.id}`, { method: 'DELETE' });
      if (!res.ok) { toast.error('Failed to delete job'); return; }
      toast.success('Job deleted');
      loadData();
    } catch { toast.error('Network error'); }
  };

  // ──────────────────────────────────────────────────────────────────────────
  const pillActive   = 'bg-[#FFB800]/10 border-[#FFB800] text-[#FFB800] px-4 py-1.5 rounded-full border text-xs font-medium transition-all';
  const pillInactive = 'bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-[#8e8e8e] dark:hover:text-white px-4 py-1.5 rounded-full border text-xs transition-all';

  return (
    <div className="min-h-screen bg-white dark:bg-[#131313]">
      <Sidebar />

      <main className="ml-0 lg:ml-64 h-screen overflow-y-auto bg-white dark:bg-[#131313] p-6 pt-20 sm:p-8 lg:p-12">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Tasks</h1>
            <p className="text-zinc-600 dark:text-[#8e8e8e] text-sm mt-1">
              {filtered.length} {filtered.length === 1 ? 'task' : 'tasks'} found
            </p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 bg-[#FFB800] text-neutral-950 font-bold px-5 py-2.5 rounded-xl shadow-md hover:brightness-95 transition-all self-start shrink-0"
          >
              <Plus className="w-4 h-4" /> New Task
          </button>
        </div>

        {/* ── Filters ────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-6 py-4 border-b border-zinc-200 dark:border-zinc-800 mb-6">
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-zinc-600 dark:text-[#8e8e8e]" />
            <input
              type="text" placeholder="Search tasks…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FFB800] placeholder-neutral-600 w-48"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-zinc-600 dark:text-[#8e8e8e]" />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-[#FFB800] cursor-pointer">
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-[#FFB800] cursor-pointer">
            <option value="all">All Categories</option>
            {JOB_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* ── Jobs List ───────────────────────────────────────────────────── */}
        {loading ? (
          <div className="p-12 text-center text-sm text-zinc-600 dark:text-[#8e8e8e] animate-pulse">Loading tasks…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-zinc-600 dark:text-[#8e8e8e] border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-[#1c1b1b] max-w-md mx-auto">
            No tasks match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filtered.map(job => {
              const isOpen   = expandedId === job.id;
              const assignee = job.assignees.find(a => a.user);
              return (
                <div key={job.id}
                  className="bg-zinc-50 dark:bg-[#1c1b1b] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden transition-all">
                  {/* Summary row */}
                  <div onClick={() => setExpandedId(isOpen ? null : job.id)}
                    className="p-5 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-[#1c1b1b] border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0">
                        <BriefcaseBusiness className="w-5 h-5 text-[#FFB800]" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-zinc-900 dark:text-white truncate">{job.title}</h3>
                        <p className="text-xs text-zinc-600 dark:text-[#8e8e8e] mt-0.5 flex flex-wrap gap-2">
                          <span>{job.location ?? '—'}</span>
                          <span>•</span>
                          <span>{job.category ?? 'Uncategorised'}</span>
                          {assignee && <><span>•</span><span className="text-zinc-600 dark:text-[#8e8e8e]">{assignee.user?.name ?? 'Unassigned'}</span></>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusBadge(job.status)}`}>
                        {job.status}
                      </span>
                      <span className="text-xs font-semibold text-[#FFB800]">{currency(job.budget)}</span>
                      <ChevronDown className={`w-4 h-4 text-zinc-600 dark:text-[#8e8e8e] transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="px-5 pb-5 pt-0 border-t border-zinc-200 dark:border-zinc-800 mt-2">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-4">

                        {/* Description */}
                        <div className="lg:col-span-2 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-[#8e8e8e]">Details</h4>
                          <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
                            {job.description ?? 'No description provided.'}
                          </p>

                          {/* Assignee strip */}
                          <div className="flex flex-wrap gap-2">
                            {job.assignees.map(a => (
                              <span key={a.id} className="flex items-center gap-1.5 text-[11px] bg-zinc-50 dark:bg-[#1c1b1b] border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 px-2.5 py-1 rounded-full">
                                <span className="w-5 h-5 rounded-full bg-[#FFB800]/10 text-[#FFB800] text-[10px] font-bold flex items-center justify-center">
                                  {a.user?.name?.[0] ?? '?'}
                                </span>
                                {a.user?.name ?? 'Unassigned'}
                                {a.roleOnJob && <span className="text-zinc-600 dark:text-[#8e8e8e]">({a.roleOnJob})</span>}
                              </span>
                            ))}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2 pt-2">
                            <button onClick={() => handleEdit(job)}
                              className="flex items-center gap-1.5 bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs px-3.5 py-2 rounded-lg text-zinc-900 dark:text-white hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-all">
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button onClick={() => handleDelete(job)}
                              className="flex items-center gap-1.5 bg-red-950/30 border border-red-900/50 text-xs px-3.5 py-2 rounded-lg text-red-400 hover:bg-red-900/40 transition-all">
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-[#8e8e8e]">Property</h4>
                          <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-2 text-xs">
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-zinc-600 dark:text-[#8e8e8e]">Location</p>
                              <p className="text-sm font-semibold text-zinc-900 dark:text-white">{job.location ?? '—'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-zinc-600 dark:text-[#8e8e8e]">Category</p>
                              <p className="text-sm font-semibold text-zinc-900 dark:text-white">{job.category ?? '—'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-zinc-600 dark:text-[#8e8e8e]">Deadline</p>
                              <p className="text-sm font-semibold text-zinc-900 dark:text-white">{job.deadline ?? '—'}</p>
                            </div>
                            {job.customer && (
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-zinc-600 dark:text-[#8e8e8e]">Client</p>
                                <p className="text-sm font-semibold text-zinc-900 dark:text-white">{job.customer.fullName}</p>
                                <p className="text-zinc-600 dark:text-[#8e8e8e]">{job.customer.email}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ══ CREATE MODAL ══════════════════════════════════════════════════════ */}
      {isCreateOpen && (
        <>
          <div onClick={() => setIsCreateOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
            <div className="relative w-full max-w-lg bg-zinc-50 dark:bg-[#1c1b1b] border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col max-h-[92vh] pointer-events-auto shadow-2xl shadow-black">

              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">New Task</h2>
                <button onClick={() => setIsCreateOpen(false)}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-neutral-800/40 rounded-lg transition">
                  <X className="w-5 h-5 text-zinc-600 dark:text-[#8e8e8e] hover:text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <label className="text-[11px] font-bold uppercase text-zinc-600 dark:text-[#8e8e8e] block">TASK DETAILS</label>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold tracking-widest text-zinc-600 dark:text-[#8e8e8e] block">Task Title *</label>
                  <input type="text" value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Villa Renovation - Milan" required
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-900 dark:text-white placeholder-neutral-600 focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] transition-all" />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold tracking-widest text-zinc-600 dark:text-[#8e8e8e] block">Description</label>
                  <textarea rows={3} value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Brief scope of work..."
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-900 dark:text-white placeholder-neutral-600 focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] transition-all resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold tracking-widest text-zinc-600 dark:text-[#8e8e8e] block">Location</label>
                    <input type="text" value={form.location}
                      onChange={e => setForm({ ...form, location: e.target.value })}
                      placeholder="e.g. Milan, Italy"
                      className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-900 dark:text-white placeholder-neutral-600 focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold tracking-widest text-zinc-600 dark:text-[#8e8e8e] block">Category</label>
                    <select value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] transition-all cursor-pointer appearance-none">
                      <option value="">— Select —</option>
                      {JOB_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold tracking-widest text-zinc-600 dark:text-[#8e8e8e] block">Budget (€)</label>
                    <input type="number" value={form.budget}
                      onChange={e => setForm({ ...form, budget: e.target.value })}
                      placeholder="0" min="0"
                      className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-900 dark:text-white placeholder-neutral-600 focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold tracking-widest text-zinc-600 dark:text-[#8e8e8e] block">Deadline</label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 dark:text-[#8e8e8e] pointer-events-none" />
                      <div className="pl-11">
                        <CustomDatePicker
                          value={form.deadline ? new Date(form.deadline) : null}
                          onChange={(d) =>
                            setForm({
                              ...form,
                              deadline: d ? d.toISOString().slice(0, 10) : '',
                            })
                          }
                          placeholder="Select deadline"
                          lang="en"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold tracking-widest text-zinc-600 dark:text-[#8e8e8e] block">Client</label>
                  <select value={form.customerId}
                    onChange={e => setForm({ ...form, customerId: e.target.value })}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] transition-all cursor-pointer">
                    <option value="">— No client assigned —</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.fullName} — {c.email}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="px-4 pt-4 pb-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#1c1b1b] flex items-center justify-end gap-3 rounded-b-2xl shrink-0">
                <button onClick={() => setIsCreateOpen(false)}
                  className="flex items-center gap-1.5 bg-[#B71C1C] text-[#212121] dark:text-[#FFEBEE] hover:opacity-90 transition-colors duration-200 border border-zinc-300 dark:border-zinc-700 px-5 py-3 rounded-xl text-sm font-semibold">
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
                <button onClick={handleCreate}
                  disabled={!form.title.trim()}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                    form.title.trim()
                      ? 'bg-[#FFB800] text-neutral-950 hover:bg-[#E5A600] active:scale-[0.98] cursor-pointer'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-[#8e8e8e] cursor-not-allowed'
                  }`}>
                  <Check className="w-4 h-4 inline mr-1.5" />Create Task
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══ EDIT MODAL ════════════════════════════════════════════════════════ */}
      {isEditOpen && editingJob && (
        <>
          <div onClick={() => setIsEditOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[55] flex items-center justify-center p-4" />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[55] pointer-events-none">
            <div className="relative w-full max-w-lg bg-zinc-50 dark:bg-[#1c1b1b] border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col max-h-[92vh] pointer-events-auto shadow-2xl shadow-black">
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Edit Task</h2>
                <button onClick={() => setIsEditOpen(false)}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-neutral-800/40 rounded-lg transition">
                  <X className="w-5 h-5 text-zinc-600 dark:text-[#8e8e8e] hover:text-white" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <label className="text-[11px] font-bold uppercase text-zinc-600 dark:text-[#8e8e8e] block">TASK DETAILS</label>
                <div>
                  <label className="text-[11px] font-bold tracking-widest text-zinc-600 dark:text-[#8e8e8e] block mb-1.5">Task Title *</label>
                  <input type="text" value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] transition-all" />
                </div>
                <div>
                  <label className="text-[11px] font-bold tracking-widest text-zinc-600 dark:text-[#8e8e8e] block mb-1.5">Description</label>
                  <textarea rows={3} value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] transition-all resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold tracking-widest text-zinc-600 dark:text-[#8e8e8e] block mb-1.5">Location</label>
                    <input type="text" value={form.location}
                      onChange={e => setForm({ ...form, location: e.target.value })}
                      className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] transition-all" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold tracking-widest text-zinc-600 dark:text-[#8e8e8e] block mb-1.5">Category</label>
                    <select value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] transition-all cursor-pointer">
                      <option value="">— Select —</option>
                      {JOB_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-bold tracking-widest text-zinc-600 dark:text-[#8e8e8e] block mb-1.5">Budget (€)</label>
                    <input type="number" value={form.budget}
                      onChange={e => setForm({ ...form, budget: e.target.value })}
                      className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] transition-all" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold tracking-widest text-zinc-600 dark:text-[#8e8e8e] block mb-1.5">Deadline</label>
                    <div className="pl-1">
                      <CustomDatePicker
                        value={form.deadline ? new Date(form.deadline) : null}
                        onChange={(d) =>
                          setForm({
                            ...form,
                            deadline: d ? d.toISOString().slice(0, 10) : '',
                          })
                        }
                        placeholder="Select deadline"
                        lang="en"
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold tracking-widest text-zinc-600 dark:text-[#8e8e8e] block mb-1.5">Status</label>
                    <select value={form.category}
                      className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] transition-all cursor-pointer"
                      onChange={()=>{}}>
                      <option>{editingJob.status}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold tracking-widest text-zinc-600 dark:text-[#8e8e8e] block mb-1.5">Client</label>
                  <select value={form.customerId}
                    onChange={e => setForm({ ...form, customerId: e.target.value })}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] transition-all cursor-pointer">
                    <option value="">— No client assigned —</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.fullName} — {c.email}</option>)}
                  </select>
                </div>
              </div>
              <div className="px-4 pt-4 pb-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#1c1b1b] flex items-center justify-end gap-3 rounded-b-2xl shrink-0">
                <button onClick={() => setIsEditOpen(false)}
                  className="flex items-center gap-1.5 bg-[#B71C1C] text-[#212121] dark:text-[#FFEBEE] hover:opacity-90 transition-colors duration-200 px-5 py-3 rounded-xl text-sm font-semibold">
                  Cancel
                </button>
                <button onClick={handleSaveEdit}
                  disabled={!form.title.trim()}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                    form.title.trim()
                      ? 'bg-[#FFB800] text-neutral-950 hover:bg-[#E5A600] active:scale-[0.98] cursor-pointer'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-[#8e8e8e] cursor-not-allowed'
                  }`}>
                  <Check className="w-4 h-4 inline mr-1.5" />Save Changes
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
