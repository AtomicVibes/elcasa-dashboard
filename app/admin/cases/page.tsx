'use client';

import Sidebar from '@/app/components/Sidebar';
import { useLanguage } from '@/context/LanguageContext';
import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  ChevronDown, ChevronUp, Calendar,
  Pencil, Trash2, Archive, FileText
} from 'lucide-react';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';

// ══════════════════════════════════════════════════════════════════════════
//  Data layer — untouched
// ══════════════════════════════════════════════════════════════════════════
const activeCases = [
  { id: 'prj-1',  title: 'Ristrutturazione Via Roma 12', location: 'Milan, Italy',     manager: 'Luca Rossi',    managerRole: 'Project Manager', reviewer: 'Marco Verdi',   progress: '45%', budget: 128000,  expenses: 57600,  deadline: '2026-08-15', category: 'Renovation',       duration: 'Long Duration',  status: 'In Progress'  },
  { id: 'prj-2',  title: 'New Office Palazzo Nuova',   location: 'Rome, Italy',       manager: 'Giulia Bianchi',managerRole: 'Super User',    reviewer: 'Luca Rossi',    progress: '72%', budget: 450000,  expenses: 324000, deadline: '2026-07-01', category: 'Construction',     duration: 'Long Duration',  status: 'In Progress'  },
  { id: 'prj-3',  title: 'Minimalist Villa Restyling', location: 'Lake Como, Italy',  manager: 'Luca Rossi',    managerRole: 'Project Manager',reviewer: 'Giulia Bianchi',progress: '28%', budget: 89000,   expenses: 24920,  deadline: '2026-10-30', category: 'Design',          duration: 'Short Duration', status: 'Pending'     },
  { id: 'prj-4',  title: 'City Bridge Footbridge',     location: 'Turin, Italy',      manager: 'Marco Verdi',   managerRole: 'Engineer',       reviewer: 'Luca Rossi',    progress: '60%', budget: 320000,  expenses: 192000, deadline: '2026-09-20', category: 'Architecture',    duration: 'Long Duration',  status: 'In Progress'  },
  { id: 'prj-5',  title: 'Apartment Core Punch',       location: 'Naples, Italy',     manager: 'Giulia Bianchi',managerRole: 'Super User',    reviewer: 'Marco Verdi',   progress: '15%', budget: 54000,   expenses: 8100,   deadline: '2026-12-05', category: 'Renovation',       duration: 'Short Duration', status: 'Completed'   },
  { id: 'prj-6',  title: 'Hotel Lobby Concept',        location: 'Milan, Italy',      manager: 'Luca Rossi',    managerRole: 'Project Manager',reviewer: 'Giulia Bianchi',progress: '90%', budget: 210000,  expenses: 189000, deadline: '2026-06-25', category: 'Design',          duration: 'Short Duration', status: 'Cancelled'   },
];

// Shared team roster (single source of truth for both Sidebar and this page)
const teamProfiles = [
  { id: 1, name: 'Luca Rossi',    email: 'luca@elcasa.com',    role: 'Super User',     function: 'Architect'      },
  { id: 2, name: 'Giulia Bianchi',email: 'giulia@elcasa.com',  role: 'Project Manager',function: 'Project Manager' },
  { id: 3, name: 'Marco Verdi',   email: 'marco@elcasa.com',   role: 'User',           function: 'Engineer'       },
];

// ══════════════════════════════════════════════════════════════════════════
//  Static category directory for the New Project form optgroup
// ══════════════════════════════════════════════════════════════════════════
const categoryGroups = [
  {
    label: 'Residential Construction',
    options: ['Single-family houses', 'Villas', 'Apartments', 'Renovation & remodeling', 'Extensions', 'Interior design'],
  },
  {
    label: 'Commercial Construction',
    options: ['Office buildings', 'Retail stores', 'Restaurants & cafés', 'Hotels', 'Warehouses', 'Shopping malls'],
  },
  {
    label: 'Industrial Construction',
    options: ['Factories', 'Power plants', 'Logistics centers', 'Chemical plants', 'Mining facilities'],
  },
  {
    label: 'Infrastructure & Civil',
    options: ['Roads & highways', 'Bridges', 'Water networks', 'Sewage systems', 'Airports', 'Railways'],
  },
  {
    label: 'Specialized Services',
    options: ['Demolition', 'Excavation', 'Foundation works', 'Scaffolding', 'Waterproofing'],
  },
  {
    label: 'MEP Systems',
    options: ['Electrical installation', 'HVAC systems', 'Solar systems', 'Plumbing', 'Fire safety', 'Elevator installation'],
  },
];

// ══════════════════════════════════════════════════════════════════════════
//  Component
// ══════════════════════════════════════════════════════════════════════════
export default function CaseFilesIndex() {
  const { t } = useLanguage();



  // ── Client-side filter / sort / expansion / new-project state ───────────
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [statusFilter, setStatusFilter]   = useState('all');
  const [activeSort, setActiveSort]       = useState('closest-deadline');
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  // ── New Project modal state ─────────────────────────────────────────────
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [newTitle,   setNewTitle]   = useState('');
  const [newCategory,setNewCategory] = useState('');
  const [newDeadline,setNewDeadline]= useState('');

  const parseDateOnly = (s: string) => {
    if (!s) return null;
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  // Member filter (toolbar)
  const allMembers = useMemo(() =>
    [...new Set(activeCases.map(c => c.manager))], []);
  const [memberFilter, setMemberFilter] = useState('all');

  // ── Derived: filtered then sorted dataset ──────────────────────────────
  const filteredAndSorted = useMemo(() => {
    let result = [...activeCases];

    if (categoryFilter !== 'all') {
      const labelMap: Record<string, string> = {
        construction: 'Construction',
        renovation: 'Renovation',
        architecture: 'Architecture',
        design: 'Design',
      };
      result = result.filter(c => c.category === labelMap[categoryFilter]);
    }

    if (durationFilter !== 'all') {
      const durationMap: Record<string, string> = {
        'short': 'Short Duration',
        'long':  'Long Duration',
      };
      result = result.filter(c => c.duration === durationMap[durationFilter]);
    }

    if (statusFilter !== 'all') {
      const statusMap: Record<string, string> = {
        'in-progress': 'In Progress',
        pending:       'Pending',
        completed:     'Completed',
        cancelled:     'Cancelled',
      };
      result = result.filter(c => c.status === statusMap[statusFilter]);
    }

    if (memberFilter !== 'all') {
      result = result.filter(c => c.manager === memberFilter);
    }

    switch (activeSort) {
      case 'closest-deadline':
        result.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
        break;
      case 'highest-budget':
        result.sort((a, b) => b.budget - a.budget);
        break;
      case 'lowest-budget':
        result.sort((a, b) => a.budget - b.budget);
        break;
      case 'alpha-asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'alpha-desc':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    return result;
  }, [activeCases, categoryFilter, durationFilter, statusFilter, memberFilter, activeSort]);

  // ── Re-assign a project to a team member ──────────────────────────────
  const handleReassign = (projectId: string, memberName: string) => {
    // Silent local-state update
    toast.success(`Project successfully re-assigned to ${memberName}!`);
  };

  // ── Create a new project entry ────────────────────────────────────────
  const handleCreateProject = () => {
    if (!newTitle.trim() || !newCategory || !newDeadline) return;

    const idNum  = activeCases.length + 1;
    const newId  = `prj-${idNum}`;

    activeCases.push({
      id:        newId,
      title:     newTitle.trim(),
      location:  '—',
      manager:   teamProfiles[0].name,
      managerRole: teamProfiles[0].function,
      reviewer:  teamProfiles[1].name,
      progress:  '0%',
      budget:    0,
      expenses:  0,
      deadline:  newDeadline,
      category:  newCategory,
      duration:  'Short Duration',
      status:    'Pending',
    });

    setNewTitle('');
    setNewCategory('');
    setNewDeadline('');
    setIsNewProjectOpen(false);
    toast.success('Success: Current Project list updated!');
  };

  // ── Pill / chip helpers ────────────────────────────────────────────────
  const currency = (n: number) => `€ ${n.toLocaleString('en-IE')}`;

  const categoryPills = [
    { key: 'all',          label: 'All Categories'  },
    { key: 'construction', label: 'Construction'    },
    { key: 'renovation',   label: 'Renovation'      },
    { key: 'architecture', label: 'Architecture'    },
    { key: 'design',       label: 'Design'          },
  ];

  const durationPills = [
    { key: 'all',    label: 'All Durations'  },
    { key: 'short',  label: 'Short Duration' },
    { key: 'long',   label: 'Long Duration'  },
  ];

  const statusPills = [
    { key: 'all',         label: 'All Statuses'  },
    { key: 'in-progress', label: 'In Progress'   },
    { key: 'pending',     label: 'Pending'        },
    { key: 'completed',   label: 'Completed'      },
    { key: 'cancelled',   label: 'Cancelled'      },
  ];

  const pillActive   = 'bg-[#FFB800]/10 border-[#FFB800] text-[#FFB800] px-4 py-1.5 rounded-full border text-xs font-medium transition-all';
  const pillInactive = 'bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-[#8e8e8e] dark:hover:text-white px-4 py-1.5 rounded-full border text-xs transition-all';

  const sortOptions = [
    { value: 'closest-deadline', label: 'Closest Deadline'  },
    { value: 'highest-budget',   label: 'Highest Budget'    },
    { value: 'lowest-budget',    label: 'Lowest Budget'     },
    { value: 'alpha-asc',        label: 'Alphabetically (A-Z)' },
    { value: 'alpha-desc',       label: 'Alphabetically (Z-A)' },
  ];

  const statusBadge: Record<string, string> = {
    'In Progress': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Pending':     'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Completed':   'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Cancelled':   'bg-red-500/10 text-red-400 border-red-500/20',
  };

  // ── Form validity gate ──────────────────────────────────────────────────
  const newProjectFormIsValid = newTitle.trim() !== '' && newCategory !== '' && newDeadline !== '';

  // ══════════════════════════════════════════════════════════════════════
  //  Render
  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-white dark:bg-[#131313]">
      <Sidebar />

      <main className="ml-0 lg:ml-64 h-screen overflow-y-auto bg-white dark:bg-[#131313] p-6 pt-20 sm:p-8 lg:p-12">


        {/* ─── Page Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">Current Projects</h1>
              <p className="text-zinc-600 dark:text-[#8e8e8e] text-sm mt-1">
              {t('cases.subtitle')}
            </p>

          </div>
          <button
            onClick={() => setIsNewProjectOpen(true)}
            className="inline-flex items-center gap-2 bg-[#FFB800] text-neutral-950 font-bold px-5 py-2.5 rounded-xl shadow-md hover:brightness-95 transition-all self-start shrink-0"
          >
            + New Project
          </button>
        </div>

        {/* ─── Filter Chip Row ─────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-6 py-4 border-b border-zinc-200 dark:border-zinc-800 mb-6">

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-[#8e8e8e] mr-1">Category:</span>
            {categoryPills.map(({ key, label }) => (
              <button key={key} onClick={() => setCategoryFilter(key)}
                className={categoryFilter === key ? pillActive : pillInactive}>{label}</button>
            ))}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-[#8e8e8e] mr-1">Duration:</span>
            {durationPills.map(({ key, label }) => (
              <button key={key} onClick={() => setDurationFilter(key)}
                className={durationFilter === key ? pillActive : pillInactive}>{label}</button>
            ))}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-[#8e8e8e] mr-1">Status:</span>
            {statusPills.map(({ key, label }) => (
              <button key={key} onClick={() => setStatusFilter(key)}
                className={statusFilter === key ? pillActive : pillInactive}>{label}</button>
            ))}
          </div>

        </div>

        {/* ─── Advanced Sorting Toolbar ─────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-50 dark:bg-[#1c1b1b] border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl mb-6">

          <div className="flex items-center gap-3 min-w-0">
            <label htmlFor="member-select" className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-[#8e8e8e] shrink-0">
              Assigned to Member
            </label>
            <select
              id="member-select"
              value={memberFilter}
              onChange={e => setMemberFilter(e.target.value)}
              className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#FFB800] cursor-pointer min-w-[160px]"
            >
              <option value="all">All Members</option>
              {allMembers.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3 min-w-0">
            <label htmlFor="sort-select" className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-[#8e8e8e] shrink-0">Sort Order:</label>
            <select
              id="sort-select"
              value={activeSort}
              onChange={e => setActiveSort(e.target.value)}
              className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#FFB800] cursor-pointer min-w-[195px]"
            >
              {sortOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>

        </div>

        {/* ─── Project List: Expandable Accordion Rows ──────────────────── */}
        {filteredAndSorted.length === 0 ? (
            <div className="flex items-center justify-center py-20">

            <div className="text-center px-6 py-12 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-[#1c1b1b] max-w-md w-full">
              <p className="text-zinc-600 dark:text-[#8e8e8e] text-sm leading-relaxed">
                No projects match your current filter selection. Try adjusting your parameters.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredAndSorted.map((project) => {
              const isOpen  = expandedProjectId === project.id;
              const utilPct = (project.expenses / project.budget) * 100;

              return (
                <div key={project.id}
                  className="bg-zinc-50 dark:bg-[#1c1b1b] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden transition-all duration-200">

                  {/* ── Summary Row ─────────────────────────────────────────── */}
                  <div
                    onClick={() => setExpandedProjectId(isOpen ? null : project.id)}
                    className="p-6 flex items-center justify-between cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white truncate">{project.title}</h3>
                      <p className="text-xs text-zinc-600 dark:text-[#8e8e8e] mt-1">
                        {project.location} • Manager: {project.manager}
                        <span className={`ml-2 inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusBadge[project.status]}`}>
                          {project.status === 'In Progress'
                            ? t('inProgress')
                            : project.status === 'Pending'
                              ? t('pending')
                              : project.status === 'Completed'
                                ? t('completed')
                                : t('cancelled')}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-bold border border-emerald-500/20">
                        {t('cases.statuses.progress')} ({project.progress})

                      </span>
                      <ChevronDown className={`w-5 h-5 text-zinc-600 dark:text-[#8e8e8e] transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* ── Expanded Detail Drawer ─────────────────────────────── */}
                  <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[680px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-6 pb-6 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-5">

                        {/* ── Left: Admin Overview ─────────────────────────────── */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-[#8e8e8e]">Administrative Overview</h4>
                              <p className="text-sm font-semibold text-zinc-900 dark:text-white">{project.title}</p>


                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                                  {t(project.category?.toLowerCase() || 'renovation')}
                                </span>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                                  {t(project.duration?.toLowerCase() || 'long')}
                                </span>
                              </div>

                          {/* Manager card */}
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
                            <div className="w-9 h-9 rounded-full bg-[#FFB800]/10 flex items-center justify-center text-xs font-bold text-[#FFB800] flex-shrink-0">
                              {project.manager.split(' ').map(n => n[0]).slice(0,2).join('')}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-zinc-900 dark:text-white">{project.manager}</p>
                              <div className="flex gap-2 mt-0.5">
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">{project.managerRole}</span>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-600/10 text-blue-400 border border-blue-600/20">Reviewer: {project.reviewer}</span>
                              </div>
                            </div>
                          </div>

                          {/* ── Assign to Team Member selector ─────────────────── */}
                          <div>
                            <label className="text-xs font-bold uppercase text-zinc-600 dark:text-[#8e8e8e] mb-1.5 block">
                              Assign to Team Member:
                            </label>
                            <select
                              value={project.manager}
                              onChange={e => handleReassign(project.id, e.target.value)}
                              className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:border-[#FFB800] outline-none max-w-xs cursor-pointer"
                            >
                              {teamProfiles.map(m => (
                                <option key={m.id} value={m.name}>{m.name} ({m.function})</option>
                              ))}
                            </select>
                          </div>

                          {/* ── Fast-action buttons ────────────────────────────── */}
                          <div className="flex flex-wrap gap-2">
                            <button className="border border-zinc-200 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 text-xs px-3 py-1.5 rounded-lg text-zinc-800 dark:text-zinc-200 hover:text-white transition-all flex items-center">
                              <Pencil   className="w-3.5 h-3.5 mr-1.5" /><span>Edit</span>
                            </button>
                            <button className="bg-[#B71C1C] text-[#212121] dark:text-[#FFEBEE] hover:opacity-90 transition-colors duration-200 border border-zinc-300 dark:border-zinc-700 text-xs px-3 py-1.5 rounded-lg flex items-center">
                              <Trash2   className="w-3.5 h-3.5 mr-1.5" /><span>Cancel</span>
                            </button>
                            <button className="border border-zinc-200 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 text-xs px-3 py-1.5 rounded-lg text-zinc-600 dark:text-[#8e8e8e] hover:text-white transition-all flex items-center">
                              <Archive  className="w-3.5 h-3.5 mr-1.5" /><span>Archive</span>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); window.open(`/api/report?projectId=${project.id}`, '_blank'); }}
                              className="border border-[#FFB800]/40 bg-[#FFB800]/10 text-xs px-3.5 py-1.5 rounded-lg text-[#FFB800] hover:bg-[#FFB800] hover:text-neutral-950 font-semibold transition-all duration-200 flex items-center"
                            >
                              <FileText className="w-3.5 h-3.5 mr-1.5" /><span>Overview</span>
                            </button>
                          </div>
                        </div>

                        {/* ── Right: Financial Progress Tracks ─────────────────── */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-[#8e8e8e]">{t('financialProgress')}</h4>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-[#8e8e8e] mb-1">Budget</p>
                              <p className="text-sm font-bold text-zinc-900 dark:text-white">{currency(project.budget)}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-[#8e8e8e] mb-1">Expenses</p>
                              <p className="text-sm font-bold text-amber-400">{currency(project.expenses)}</p>
                            </div>
                          </div>

                          {/* utilisation bar */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <p className="text-[11px] font-medium text-zinc-600 dark:text-[#8e8e8e]">{t('budgetUtilization')}</p>
                              <p className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">{utilPct.toFixed(1)}%</p>
                            </div>
                            <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                              <div className="h-2 bg-[#FFB800] rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(utilPct, 100)}%` }}/>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* ── Bottom Collapse Row Link ─────────────────────────── */}
                      <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        <button
                          onClick={() => setExpandedProjectId(null)}
                          className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-[#8e8e8e] hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />Retract details
                        </button>
                      </div>

                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* ══════════════════════════════════════════════════════════════════
          NEW PROJECT CREATION MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {isNewProjectOpen && (
        <>
          <div onClick={() => setIsNewProjectOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" />

          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
            <div className="relative w-full max-w-xl bg-zinc-50 dark:bg-[#1c1b1b] border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col max-h-[90vh] pointer-events-auto shadow-2xl shadow-black">

              {/* ── Modal Header ──────────────────────────────────────── */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">New Project</h2>
                <button onClick={() => setIsNewProjectOpen(false)}
                  className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800/40 rounded-lg transition">
                  <span className="text-zinc-600 dark:text-[#8e8e8e] dark:hover:text-white text-lg leading-none">✕</span>
                </button>
              </div>

              {/* ── Scrollable Form Body ───────────────────────────────── */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                {/* Field 1: Project Title */}
                <div>
                  <label className="text-[11px] font-bold tracking-widest text-zinc-600 dark:text-[#8e8e8e] mb-2 block">
                    Project Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Residenza Via Roma"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-900 dark:text-white placeholder-neutral-600 focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] transition-all"
                  />
                </div>

                {/* Field 2: Multi-level Category Dropdown */}
                <div>
                  <label className="text-[11px] font-bold tracking-widest text-zinc-600 dark:text-[#8e8e8e] mb-2 block">
                    Project Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] transition-all appearance-none cursor-pointer"
                  >
                    <option value="">— Select a category —</option>
                    {categoryGroups.map(group => (
                      <optgroup key={group.label} label={group.label}>
                        {group.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Field 3: Date Picker */}
                <div>
                  <label className="text-[11px] font-bold tracking-widest text-zinc-600 dark:text-[#8e8e8e] mb-2 block">
                    Set Project Deadline
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 dark:text-[#8e8e8e] pointer-events-none" />
                    <div className="pl-11">
                      <CustomDatePicker
                        value={parseDateOnly(newDeadline)}
                        onChange={(d) =>
                          setNewDeadline(d ? d.toISOString().slice(0, 10) : '')
                        }
                        placeholder="Select deadline"
                        lang="en"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* ── Fixed Footer ───────────────────────────────────────── */}
              <div className="px-4 pt-4 pb-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#1c1b1b] flex items-center justify-end gap-3 rounded-b-2xl shrink-0">
                <button
                  onClick={() => setIsNewProjectOpen(false)}
                  className="flex items-center gap-1.5 bg-[#B71C1C] text-[#212121] dark:text-[#FFEBEE] hover:opacity-90 transition-colors duration-200 border border-zinc-300 dark:border-zinc-700 px-5 py-2.5 rounded-xl text-sm font-semibold shrink-0"
                >
                  <span>✕</span> Cancel Project
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={!newProjectFormIsValid}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 ${
                    newProjectFormIsValid
                      ? 'bg-[#FFB800] text-neutral-950 hover:bg-[#E5A600] active:scale-[0.98] cursor-pointer'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-[#8e8e8e] cursor-not-allowed'
                  }`}
                >
                  Create Project
                </button>
              </div>

            </div>
          </div>
        </>
      )}

    </div>
  );
}
