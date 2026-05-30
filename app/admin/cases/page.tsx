'use client';

import Sidebar from '@/app/components/Sidebar';
import { useLanguage } from '@/context/LanguageContext';
import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  ChevronDown, ChevronUp, Calendar,
  Pencil, Trash2, Archive, FileText, Search
} from 'lucide-react';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
import { FilterButtonGroup } from '@/components/FilterButtonGroup';
import { useProjectFilters } from '@/hooks/useProjectFilters';
import type { Project } from '@/hooks/useProjectFilters';

const activeCases: Project[] = [
  { id: 'prj-1',  title: 'Ristrutturazione Via Roma 12', location: 'Milan, Italy',     manager: 'Luca Rossi',    managerRole: 'Project Manager', reviewer: 'Marco Verdi',   progress: '45%', budget: 128000,  expenses: 57600,  deadline: '2026-08-15', category: 'Renovation',       duration: 'Long Duration',  status: 'In Progress'  },
  { id: 'prj-2',  title: 'New Office Palazzo Nuova',   location: 'Rome, Italy',       manager: 'Giulia Bianchi',managerRole: 'Super User',    reviewer: 'Luca Rossi',    progress: '72%', budget: 450000,  expenses: 324000, deadline: '2026-07-01', category: 'Construction',     duration: 'Long Duration',  status: 'In Progress'  },
  { id: 'prj-3',  title: 'Minimalist Villa Restyling', location: 'Lake Como, Italy',  manager: 'Luca Rossi',    managerRole: 'Project Manager',reviewer: 'Giulia Bianchi',progress: '28%', budget: 89000,   expenses: 24920,  deadline: '2026-10-30', category: 'Design',          duration: 'Short Duration', status: 'Pending'     },
  { id: 'prj-4',  title: 'City Bridge Footbridge',     location: 'Turin, Italy',      manager: 'Marco Verdi',   managerRole: 'Engineer',       reviewer: 'Luca Rossi',    progress: '60%', budget: 320000,  expenses: 192000, deadline: '2026-09-20', category: 'Architecture',    duration: 'Long Duration',  status: 'In Progress'  },
  { id: 'prj-5',  title: 'Apartment Core Punch',       location: 'Naples, Italy',     manager: 'Giulia Bianchi',managerRole: 'Super User',    reviewer: 'Marco Verdi',   progress: '15%', budget: 54000,   expenses: 8100,   deadline: '2026-12-05', category: 'Renovation',       duration: 'Short Duration', status: 'Completed'   },
  { id: 'prj-6',  title: 'Hotel Lobby Concept',        location: 'Milan, Italy',      manager: 'Luca Rossi',    managerRole: 'Project Manager',reviewer: 'Giulia Bianchi',progress: '90%', budget: 210000,  expenses: 189000, deadline: '2026-06-25', category: 'Design',          duration: 'Short Duration', status: 'Cancelled'   },
];

const teamProfiles = [
  { id: 1, name: 'Luca Rossi',    email: 'luca@elcasa.com',    role: 'Super User',     function: 'Architect'      },
  { id: 2, name: 'Giulia Bianchi',email: 'giulia@elcasa.com',  role: 'Project Manager',function: 'Project Manager' },
  { id: 3, name: 'Marco Verdi',   email: 'marco@elcasa.com',   role: 'User',           function: 'Engineer'       },
];

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

export default function CaseFilesIndex() {
  const { t } = useLanguage();

  const { filters, setCategory, setDuration, setStatus, setSearch, resetFilters, activeProjects, isEmpty, hasActiveFilters } = useProjectFilters(activeCases);

  const [activeSort, setActiveSort] = useState('closest-deadline');
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [newTitle,   setNewTitle]   = useState('');
  const [newCategory,setNewCategory] = useState('');
  const [newDeadline,setNewDeadline]= useState('');

  const parseDateOnly = (s: string) => {
    if (!s) return null;
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const allMembers = useMemo(() =>
    [...new Set(activeCases.map(c => c.manager))], []);
  const [memberFilter, setMemberFilter] = useState('all');

  const filteredAndSorted = useMemo(() => {
    let result = [...activeProjects];

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
  }, [activeProjects, memberFilter, activeSort]);

  const stats = useMemo(() => ({
    total: activeCases.length,
    inProgress: activeCases.filter((p) => p.status === 'In Progress').length,
    completed: activeCases.filter((p) => p.status === 'Completed').length,
    pending: activeCases.filter((p) => p.status === 'Pending').length,
  }), []);

  const handleReassign = (projectId: string, memberName: string) => {
    toast.success(`Project successfully re-assigned to ${memberName}!`);
  };

  const handleCreateProject = () => {
    if (!newTitle.trim() || !newCategory || !newDeadline) return;

    const idNum  = activeCases.length + 1;
    const newId  = `prj-${idNum}`;

    activeCases.push({
      id:        newId,
      title:     newTitle.trim(),
      location:  '\u2014',
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

  const currency = (n: number) => `\u20AC ${n.toLocaleString('en-IE')}`;

  const categoryOptions = [
    { key: 'all',          label: t('cases.categories.all'),          i18nKey: 'cases.categories.all' },
    { key: 'Construction', label: t('cases.categories.construction'), i18nKey: 'cases.categories.construction' },
    { key: 'Renovation',   label: t('cases.categories.renovation'),   i18nKey: 'cases.categories.renovation' },
    { key: 'Architecture', label: t('cases.categories.architecture'), i18nKey: 'cases.categories.architecture' },
    { key: 'Design',       label: t('cases.categories.design'),       i18nKey: 'cases.categories.design' },
  ];

  const durationOptions = [
    { key: 'all',            label: t('allDurations'), i18nKey: 'allDurations' },
    { key: 'Short Duration', label: t('short'),        i18nKey: 'short' },
    { key: 'Long Duration',  label: t('long'),         i18nKey: 'long' },
  ];

  const statusOptions = [
    { key: 'all',          label: t('allStatuses'), i18nKey: 'allStatuses' },
    { key: 'In Progress',  label: t('inProgress'),  i18nKey: 'inProgress' },
    { key: 'Pending',      label: t('pending'),      i18nKey: 'pending' },
    { key: 'Completed',    label: t('completed'),    i18nKey: 'completed' },
    { key: 'Cancelled',    label: t('cancelled'),    i18nKey: 'cancelled' },
  ];

  const sortOptions = [
    { value: 'closest-deadline', label: t('closestDeadline') },
    { value: 'highest-budget',   label: t('highestBudget')   },
    { value: 'lowest-budget',    label: t('lowestBudget')    },
    { value: 'alpha-asc',        label: t('alphabeticallyAZ') },
    { value: 'alpha-desc',       label: t('alphabeticallyZA') },
  ];

  const statusBadge: Record<string, string> = {
    'In Progress': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Pending':     'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Completed':   'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Cancelled':   'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const newProjectFormIsValid = newTitle.trim() !== '' && newCategory !== '' && newDeadline !== '';

  return (
    <div className="min-h-screen bg-background dark:bg-forge-black">
      <Sidebar />

      <main className="ml-0 lg:ml-64 h-screen overflow-y-auto bg-background dark:bg-forge-black p-6 pt-20 sm:p-8 lg:p-12">

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground" data-i18n="cases.title">
              {t('cases.title')}
            </h1>
            <p className="text-muted-foreground text-sm mt-1" data-i18n="cases.subtitle">
              {t('cases.subtitle')}
            </p>
          </div>
          <button
            onClick={() => setIsNewProjectOpen(true)}
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-bold px-5 py-2.5 rounded-xl shadow-md hover:brightness-95 transition-all self-start shrink-0"
            data-i18n="cases.newBtn"
          >
            {t('cases.newBtn')}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-muted dark:bg-card p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <p className="text-xs font-bold text-foreground uppercase tracking-widest" data-i18n="cases.total">{t('cases.total')}</p>
            <h3 className="text-4xl lg:text-5xl font-black mt-3 text-foreground tracking-tight">{stats.total}</h3>
            <span className="inline-flex items-center text-[11px] text-muted-foreground font-medium mt-2 px-2 py-0.5 rounded-md bg-background dark:bg-zinc-800 border border-zinc-200 dark:border-neutral-700/40" data-i18n="allTime">
              {t('allTime')}
            </span>
          </div>
          <div className="bg-muted dark:bg-card p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <p className="text-xs font-bold text-foreground uppercase tracking-widest" data-i18n="inProgress">{t('inProgress')}</p>
            <h3 className="text-4xl lg:text-5xl font-black mt-3 text-emerald-400 tracking-tight">{stats.inProgress}</h3>
            <span className="inline-flex items-center text-[11px] text-emerald-500 font-medium mt-2 px-2 py-0.5 rounded-md bg-emerald-500/5 border border-emerald-500/10" data-i18n="cases.badgeActive">
              {t('cases.badgeActive')}
            </span>
          </div>
          <div className="bg-muted dark:bg-card p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <p className="text-xs font-bold text-foreground uppercase tracking-widest" data-i18n="completed">{t('completed')}</p>
            <h3 className="text-4xl lg:text-5xl font-black mt-3 text-blue-400 tracking-tight">{stats.completed}</h3>
            <span className="inline-flex items-center text-[11px] text-blue-500 font-medium mt-2 px-2 py-0.5 rounded-md bg-blue-500/5 border border-blue-500/10" data-i18n="cases.badgeDelivered">
              {t('cases.badgeDelivered')}
            </span>
          </div>
          <div className="bg-muted dark:bg-card p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <p className="text-xs font-bold text-foreground uppercase tracking-widest" data-i18n="pending">{t('pending')}</p>
            <h3 className="text-4xl lg:text-5xl font-black mt-3 text-amber-400 tracking-tight">{stats.pending}</h3>
            <span className="inline-flex items-center text-[11px] text-amber-500 font-medium mt-2 px-2 py-0.5 rounded-md bg-amber-500/5 border border-amber-500/10" data-i18n="cases.badgeAwaiting">
              {t('cases.badgeAwaiting')}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 py-4 border-b border-zinc-200 dark:border-zinc-800 mb-6">
          <FilterButtonGroup
            label={`${t('category')}:`}
            labelI18nKey="category"
            options={categoryOptions}
            active={filters.category}
            onChange={setCategory}
          />

          <FilterButtonGroup
            label={`${t('duration')}:`}
            labelI18nKey="duration"
            options={durationOptions}
            active={filters.duration}
            onChange={setDuration}
          />

          <FilterButtonGroup
            label={`${t('status')}:`}
            labelI18nKey="status"
            options={statusOptions}
            active={filters.status}
            onChange={setStatus}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 bg-muted dark:bg-card border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl mb-6">

          <div className="flex items-center gap-3 min-w-0">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchProjectsPlaceholder') || 'Search projects...'}
              data-i18n="searchProjectsPlaceholder"
              className="bg-background dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent min-w-[180px]"
            />
          </div>

          <div className="flex items-center gap-3 min-w-0">
            <label htmlFor="member-select" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground shrink-0" data-i18n="assignedToMember">
              {t('assignedToMember')}
            </label>
            <select
              id="member-select"
              value={memberFilter}
              onChange={e => setMemberFilter(e.target.value)}
              className="bg-background dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent cursor-pointer min-w-[160px]"
              data-i18n="memberFilterSelect"
            >
              <option value="all" data-i18n="allMembers">{t('allMembers')}</option>
              {allMembers.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3 min-w-0">
            <label htmlFor="sort-select" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground shrink-0" data-i18n="sortOrder">{t('sortOrder')}:</label>
            <select
              id="sort-select"
              value={activeSort}
              onChange={e => setActiveSort(e.target.value)}
              className="bg-background dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent cursor-pointer min-w-[195px]"
              data-i18n="sortSelect"
            >
              {sortOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-[11px] font-semibold uppercase tracking-wider text-accent hover:opacity-80 transition-opacity"
              data-i18n="clearFilters"
            >
              {t('clearFilters') || 'Clear filters'}
            </button>
          )}

        </div>

        {isEmpty && filteredAndSorted.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center px-6 py-12 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-muted dark:bg-card max-w-md w-full">
              <p className="text-muted-foreground text-sm leading-relaxed" data-i18n="noProjectsMatch">
                {t('noProjectsMatch')}
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
                  className="bg-muted dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden transition-all duration-200">

                  <div
                    onClick={() => setExpandedProjectId(isOpen ? null : project.id)}
                    className="p-6 flex items-center justify-between cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-foreground truncate" data-i18n={undefined}>{project.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {project.location} {'\u2022'} {t('projectManager')}: {project.manager}
                        <span className={`ml-2 inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusBadge[project.status]}`} data-i18n={project.status === 'In Progress' ? 'inProgress' : project.status === 'Pending' ? 'pending' : project.status === 'Completed' ? 'completed' : 'cancelled'}>
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
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-bold border border-emerald-500/20" data-i18n="cases.statuses.progress">
                        {t('cases.statuses.progress')} ({project.progress})
                      </span>
                      <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[680px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-6 pb-6 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-5">

                        <div className="space-y-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground" data-i18n="administrativeOverview">
                            {t('administrativeOverview')}
                          </h4>
                          <p className="text-sm font-semibold text-foreground" data-i18n={undefined}>{project.title}</p>

                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-background dark:bg-zinc-800 text-foreground" data-i18n={project.category?.toLowerCase()}>
                              {t(project.category?.toLowerCase() || 'renovation')}
                            </span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-background dark:bg-zinc-800 text-foreground" data-i18n={project.duration?.toLowerCase()}>
                              {t(project.duration?.toLowerCase() || 'long')}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 p-3 rounded-xl bg-background dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
                            <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent flex-shrink-0">
                              {project.manager.split(' ').map(n => n[0]).slice(0,2).join('')}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground" data-i18n={undefined}>{project.manager}</p>
                              <div className="flex gap-2 mt-0.5">
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-background dark:bg-zinc-800 text-foreground">{project.managerRole}</span>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-600/10 text-blue-400 border border-blue-600/20" data-i18n="reviewer">
                                  {t('reviewer')}: {project.reviewer}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-bold uppercase text-muted-foreground mb-1.5 block" data-i18n="assignToTeamMember">
                              {t('assignToTeamMember')}
                            </label>
                            <select
                              value={project.manager}
                              onChange={e => handleReassign(project.id, e.target.value)}
                              className="bg-background dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none max-w-xs cursor-pointer"
                              data-i18n="reassignMemberSelect"
                            >
                              {teamProfiles.map(m => (
                                <option key={m.id} value={m.name}>{m.name} ({m.function})</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button className="border border-zinc-200 dark:border-zinc-700 bg-background dark:bg-zinc-800 text-xs px-3 py-1.5 rounded-lg text-foreground hover:text-white transition-all flex items-center" data-i18n="edit">
                              <Pencil className="w-3.5 h-3.5 mr-1.5" /><span>{t('edit')}</span>
                            </button>
                            <button className="bg-red-700 text-red-100 hover:opacity-90 transition-colors duration-200 border border-zinc-300 dark:border-zinc-700 text-xs px-3 py-1.5 rounded-lg flex items-center" data-i18n="cancelProjectAction">
                              <Trash2 className="w-3.5 h-3.5 mr-1.5" /><span>{t('cancelProjectAction')}</span>
                            </button>
                            <button className="border border-zinc-200 dark:border-zinc-700 bg-background dark:bg-zinc-800 text-xs px-3 py-1.5 rounded-lg text-muted-foreground hover:text-white transition-all flex items-center" data-i18n="archive">
                              <Archive className="w-3.5 h-3.5 mr-1.5" /><span>{t('archive')}</span>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); window.open(`/api/report?projectId=${project.id}`, '_blank'); }}
                              className="border border-accent/40 bg-accent/10 text-xs px-3.5 py-1.5 rounded-lg text-accent hover:bg-accent hover:text-accent-foreground font-semibold transition-all duration-200 flex items-center"
                              data-i18n="overview"
                            >
                              <FileText className="w-3.5 h-3.5 mr-1.5" /><span>{t('overview')}</span>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground" data-i18n="financialProgress">
                            {t('financialProgress')}
                          </h4>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-background dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1" data-i18n="financialProgressBudget">{t('financialProgressBudget')}</p>
                              <p className="text-sm font-bold text-foreground">{currency(project.budget)}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-background dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1" data-i18n="financialProgressExpenses">{t('financialProgressExpenses')}</p>
                              <p className="text-sm font-bold text-amber-400">{currency(project.expenses)}</p>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <p className="text-[11px] font-medium text-muted-foreground" data-i18n="budgetUtilization">{t('budgetUtilization')}</p>
                              <p className="text-[11px] font-bold text-foreground">{utilPct.toFixed(1)}%</p>
                            </div>
                            <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                              <div className="h-2 bg-accent rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(utilPct, 100)}%` }}/>
                            </div>
                          </div>
                        </div>

                      </div>

                      <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        <button
                          onClick={() => setExpandedProjectId(null)}
                          className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                          data-i18n="retractDetails"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />{t('retractDetails')}
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

      {isNewProjectOpen && (
        <>
          <div onClick={() => setIsNewProjectOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" />

          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
            <div className="relative w-full max-w-xl bg-muted dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col max-h-[90vh] pointer-events-auto shadow-2xl shadow-black">

              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-xl font-bold text-foreground" data-i18n="newProjectTitle">{t('newProjectTitle')}</h2>
                <button onClick={() => setIsNewProjectOpen(false)}
                  className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800/40 rounded-lg transition">
                  <span className="text-muted-foreground dark:hover:text-white text-lg leading-none">{'\u2715'}</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                <div>
                  <label className="text-[11px] font-bold tracking-widest text-muted-foreground mb-2 block" data-i18n="projectTitle">
                    {t('projectTitle')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Residenza Via Roma"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full bg-background dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                    data-i18n="newProjectTitleInput"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold tracking-widest text-muted-foreground mb-2 block" data-i18n="projectCategory">
                    {t('projectCategory')}
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full bg-background dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all appearance-none cursor-pointer"
                    data-i18n="newProjectCategorySelect"
                  >
                    <option value="" data-i18n="selectCategory">{t('selectCategory')}</option>
                    {categoryGroups.map(group => (
                      <optgroup key={group.label} label={group.label}>
                        {group.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold tracking-widest text-muted-foreground mb-2 block" data-i18n="projectDeadline">
                    {t('projectDeadline')}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
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

              <div className="px-4 pt-4 pb-4 border-t border-zinc-200 dark:border-zinc-800 bg-muted dark:bg-card flex items-center justify-end gap-3 rounded-b-2xl shrink-0">
                <button
                  onClick={() => setIsNewProjectOpen(false)}
                  className="flex items-center gap-1.5 bg-red-700 text-red-100 hover:opacity-90 transition-colors duration-200 border border-zinc-300 dark:border-zinc-700 px-5 py-2.5 rounded-xl text-sm font-semibold shrink-0"
                  data-i18n="cancelProjectAction"
                >
                  <span>{'\u2715'}</span> {t('cancelProjectAction')}
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={!newProjectFormIsValid}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 ${
                    newProjectFormIsValid
                      ? 'bg-accent text-accent-foreground hover:brightness-90 active:scale-[0.98] cursor-pointer'
                      : 'bg-muted dark:bg-zinc-800 text-muted-foreground cursor-not-allowed'
                  }`}
                  data-i18n="createProject"
                >
                  {t('createProject')}
                </button>
              </div>

            </div>
          </div>
        </>
      )}

    </div>
  );
}
