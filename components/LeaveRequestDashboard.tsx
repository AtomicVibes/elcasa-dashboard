'use client';

import { useState } from 'react';
import { Calendar, Filter, CheckCircle, XCircle, ChevronDown, Download, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface LeaveRequest {
  id: number;
  employeeName: string;
  employeeInitials: string;
  leaveType: 'vacation' | 'sick' | 'personal' | 'bereavement';
  startDate: string;
  endDate: string;
  duration: number;
  status: 'approved' | 'pending' | 'rejected';
}

export const leaveTypeLabels: Record<LeaveRequest['leaveType'], { en: string; it: string }> = {
  vacation: { en: 'Vacation', it: 'Vacanza' },
  sick: { en: 'Sick Leave', it: 'Malattia' },
  personal: { en: 'Personal', it: 'Personale' },
  bereavement: { en: 'Bereavement', it: 'Luto' },
};

interface LeaveRequestDashboardProps {
  requests: LeaveRequest[];
  stats: { total: number; pending: number; approved: number; rejected: number };
  filterStatus: string;
  onFilterStatusChange: (status: 'all' | LeaveRequest['status']) => void;
  sortByDate: string;
  onSortByDateChange: (sort: 'newest' | 'oldest') => void;
  onStatusChange: (id: number, status: 'approved' | 'rejected') => void;
  onExportCsv: () => void;
  getLeaveTypeLabel: (type: LeaveRequest['leaveType']) => string;
  formatDate: (dateStr: string) => string;
  getStatusBadgeLabel: (status: LeaveRequest['status']) => string;
  t: (key: string) => string;
  lang: 'EN' | 'IT';
}

const statusStyles: Record<string, string> = {
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};



export default function LeaveRequestDashboard({
  requests,
  stats,
  filterStatus,
  onFilterStatusChange,
  sortByDate,
  onSortByDateChange,
  onStatusChange,
  onExportCsv,
  getLeaveTypeLabel,
  formatDate,
  getStatusBadgeLabel,
  t,
  lang,
}: LeaveRequestDashboardProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const isEn = lang === 'EN';

  const filterOptions: Array<{ key: 'all' | LeaveRequest['status']; label: string }> = [
    { key: 'all', label: isEn ? 'All Statuses' : 'Tutti gli Stati' },
    { key: 'pending', label: isEn ? 'Pending' : 'In Attesa' },
    { key: 'approved', label: isEn ? 'Approved' : 'Approvato' },
    { key: 'rejected', label: isEn ? 'Rejected' : 'Rifiutato' },
  ];

  const sortOptions: Array<{ key: 'newest' | 'oldest'; label: string }> = [
    { key: 'newest', label: isEn ? 'Newest First' : 'Più recenti' },
    { key: 'oldest', label: isEn ? 'Oldest First' : 'Più vecchi' },
  ];

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard label={t('leaveRequests.total')} value={stats.total} sub={isEn ? 'All time' : 'Sempre'} />
        <StatCard label={t('leaveRequests.pending')} value={stats.pending} sub={isEn ? 'Awaiting action' : 'In attesa'} valueClass="text-amber-400" subClass="text-amber-500 bg-amber-500/5 border-amber-500/10" />
        <StatCard label={t('leaveRequests.approved')} value={stats.approved} sub={isEn ? 'Confirmed' : 'Confermato'} valueClass="text-emerald-400" subClass="text-emerald-500 bg-emerald-500/5 border-emerald-500/10" />
        <StatCard label={t('leaveRequests.rejected')} value={stats.rejected} sub={isEn ? 'Denied' : 'Negato'} valueClass="text-red-400" subClass="text-red-500 bg-red-500/5 border-red-500/10" />
      </div>

      {/* Filter + Export Bar */}
      <div className="flex items-center justify-between mb-6">
        <div />
        <div className="flex items-center gap-3">
          {/* Desktop Filter Popover (hidden on mobile) */}
          <div className="hidden md:block">
            <Popover>
              <PopoverTrigger asChild>
                <button className="inline-flex items-center gap-2 bg-zinc-50 dark:bg-[#1c1b1b] border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800/60">
                  <Filter className="w-4 h-4" />
                  <span>{t('leaveRequests.filterBtn')}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-[320px] p-3 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#1c1b1b] text-zinc-900 dark:text-white"
              >
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-600 dark:text-[#8e8e8e]">{isEn ? 'Status' : 'Stato'}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {filterOptions.map(({ key, label }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => onFilterStatusChange(key)}
                          className={
                            filterStatus === key
                              ? 'px-3 py-2 rounded-lg bg-[#FFC107] text-black text-xs font-bold hover:brightness-95'
                              : 'px-3 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-[#8e8e8e] text-xs font-semibold hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-300 dark:hover:bg-zinc-800/60 transition-colors'
                          }
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-600 dark:text-[#8e8e8e]">
                      {isEn ? 'Sort by Date' : 'Ordinamento per data'}
                    </p>
                    <div className="mt-2 grid grid-cols-1 gap-2">
                      {sortOptions.map(({ key, label }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => onSortByDateChange(key)}
                          className={
                            sortByDate === key
                              ? 'w-full justify-center px-3 py-2 rounded-lg bg-[#FFC107] text-black text-xs font-bold hover:brightness-95'
                              : 'w-full justify-center px-3 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-[#8e8e8e] text-xs font-semibold hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-300 dark:hover:bg-zinc-800/60 transition-colors'
                          }
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Mobile Filter Trigger (hidden on desktop) */}
          <button
            onClick={() => setShowMobileFilter(true)}
            className="md:hidden inline-flex items-center gap-2 bg-zinc-50 dark:bg-[#1c1b1b] border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
          >
            <Filter className="w-4 h-4" />
            <span>{t('leaveRequests.filterBtn')}</span>
          </button>

          <button
            onClick={onExportCsv}
            className="inline-flex items-center gap-2 bg-[#FFB800] text-neutral-950 font-bold px-4 py-2.5 rounded-xl shadow-md hover:brightness-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{t('leaveRequests.exportBtn')}</span>
          </button>
        </div>
      </div>

      {/* Desktop: High-Density Table (hidden on mobile) */}
      <div className="hidden md:block bg-zinc-50 dark:bg-[#1c1b1b] rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#1c1b1b] text-zinc-600 dark:text-[#8e8e8e] text-xs uppercase font-bold tracking-widest">
              <th className="py-5 px-6">{t('leaveRequests.tableHead.employee')}</th>
              <th className="py-5 px-6">{t('leaveRequests.tableHead.leaveType')}</th>
              <th className="py-5 px-6">{t('leaveRequests.tableHead.duration')}</th>
              <th className="py-5 px-6">{t('leaveRequests.tableHead.status')}</th>
              <th className="py-5 px-6 w-32 text-right">{t('leaveRequests.tableHead.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60">
            {requests.map((request) => (
              <tr key={request.id} className="hover:bg-zinc-100 dark:hover:bg-[#151515] transition-colors">
                <td className="py-5 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-[#1c1b1b] flex items-center justify-center text-sm font-bold text-[#FFB800]">
                      {request.employeeInitials}
                    </div>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{request.employeeName}</span>
                  </div>
                </td>
                <td className="py-5 px-6 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  {getLeaveTypeLabel(request.leaveType)}
                </td>
                <td className="py-5 px-6 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-600 dark:text-[#8e8e8e] shrink-0" />
                    <span>
                      {formatDate(request.startDate)} - {formatDate(request.endDate)}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-600 dark:text-[#8e8e8e] ml-6">{request.duration} days</span>
                </td>
                <td className="py-5 px-6">
                  <span className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusStyles[request.status]}`}>
                    {getStatusBadgeLabel(request.status)}
                  </span>
                </td>
                <td className="py-5 px-6">
                  {request.status === 'pending' ? (
                    <div className="flex items-center justify-end gap-2 md:w-32 ml-auto">
                      <button
                        onClick={() => onStatusChange(request.id, 'approved')}
                        className="inline-flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{t('leaveRequests.action.approve')}</span>
                      </button>
                      <button
                        onClick={() => onStatusChange(request.id, 'rejected')}
                        className="inline-flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{t('leaveRequests.action.reject')}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end md:w-32 ml-auto">
                      <span className="text-xs text-zinc-600 dark:text-[#8e8e8e]">&mdash;</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-zinc-600 dark:text-[#8e8e8e]">
                  {t('leaveRequests.noRequests')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: Expandable Cards (hidden on desktop) */}
      <div className="md:hidden space-y-3">
        {requests.map((request) => {
          const isOpen = expandedId === request.id;
          return (
            <div
              key={request.id}
              className="bg-zinc-50 dark:bg-[#1c1b1b] rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-all duration-200"
            >
              {/* Card Header (always visible) */}
              <button
                onClick={() => setExpandedId(isOpen ? null : request.id)}
                className="w-full p-4 flex items-center justify-between gap-3 text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-[#0e0e0e] flex items-center justify-center text-sm font-bold text-[#FFB800] shrink-0">
                    {request.employeeInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{request.employeeName}</p>
                    <p className="text-xs text-zinc-500 dark:text-[#8e8e8e] mt-0.5">{getLeaveTypeLabel(request.leaveType)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusStyles[request.status]}`}>
                    {getStatusBadgeLabel(request.status)}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Expandable Content (accordion) */}
              <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[280px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-4 pb-4 pt-1 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                  {/* Date Range */}
                  <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-[#8e8e8e]">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {formatDate(request.startDate)} - {formatDate(request.endDate)}
                    </span>
                    <span className="text-zinc-400 dark:text-zinc-600">(&middot; {request.duration} {isEn ? 'days' : 'giorni'})</span>
                  </div>

                  {/* Action Buttons */}
                  {request.status === 'pending' ? (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onStatusChange(request.id, 'approved')}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>{t('leaveRequests.action.approve')}</span>
                      </button>
                      <button
                        onClick={() => onStatusChange(request.id, 'rejected')}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>{t('leaveRequests.action.reject')}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="pt-1">
                      <span className="text-xs text-zinc-500 dark:text-zinc-600 italic">
                        {isEn ? 'No action needed' : 'Nessuna azione necessaria'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {requests.length === 0 && (
          <div className="py-12 text-center text-sm text-zinc-600 dark:text-[#8e8e8e]">
            {t('leaveRequests.noRequests')}
          </div>
        )}
      </div>

      {/* Mobile Bottom-Sheet Filter */}
      {showMobileFilter && (
        <MobileFilterSheet
          filterStatus={filterStatus}
          sortByDate={sortByDate}
          onFilterStatusChange={(s) => { onFilterStatusChange(s); }}
          onSortByDateChange={(s) => { onSortByDateChange(s); }}
          onClose={() => setShowMobileFilter(false)}
          filterOptions={filterOptions}
          sortOptions={sortOptions}
          isEn={isEn}
        />
      )}
    </>
  );
}

/* ─── Sub-components ──────────────────────────────────────────────── */

function StatCard({
  label,
  value,
  sub,
  valueClass,
  subClass,
}: {
  label: string;
  value: number;
  sub: string;
  valueClass?: string;
  subClass?: string;
}) {
  return (
    <div className="bg-zinc-50 dark:bg-[#1c1b1b] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">{label}</p>
      <h3 className={`text-4xl lg:text-5xl font-black mt-3 tracking-tight ${valueClass || 'text-zinc-900 dark:text-white'}`}>
        {value}
      </h3>
      <span className={`inline-flex items-center text-[11px] font-medium mt-2 px-2 py-0.5 rounded-md border ${subClass || 'text-zinc-600 dark:text-[#8e8e8e] bg-zinc-100 border-zinc-200 dark:bg-neutral-800 dark:border-neutral-700/40'}`}>
        {sub}
      </span>
    </div>
  );
}

function MobileFilterSheet({
  filterStatus,
  sortByDate,
  onFilterStatusChange,
  onSortByDateChange,
  onClose,
  filterOptions,
  sortOptions,
  isEn,
}: {
  filterStatus: string;
  sortByDate: string;
  onFilterStatusChange: (status: 'all' | LeaveRequest['status']) => void;
  onSortByDateChange: (sort: 'newest' | 'oldest') => void;
  onClose: () => void;
  filterOptions: Array<{ key: 'all' | LeaveRequest['status']; label: string }>;
  sortOptions: Array<{ key: 'newest' | 'oldest'; label: string }>;
  isEn: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-zinc-50 dark:bg-[#1c1b1b] rounded-t-2xl border-t border-zinc-200 dark:border-zinc-800 shadow-2xl max-h-[70vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-zinc-50 dark:bg-[#1c1b1b] flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <span className="text-sm font-bold text-zinc-900 dark:text-white">
            {isEn ? 'Filters' : 'Filtri'}
          </span>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-600 dark:text-[#8e8e8e] mb-3">
              {isEn ? 'Status' : 'Stato'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {filterOptions.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onFilterStatusChange(key)}
                  className={
                    filterStatus === key
                      ? 'px-3 py-2.5 rounded-xl bg-[#FFC107] text-black text-xs font-bold hover:brightness-95'
                      : 'px-3 py-2.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-[#8e8e8e] text-xs font-semibold transition-colors'
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-600 dark:text-[#8e8e8e] mb-3">
              {isEn ? 'Sort by Date' : 'Ordinamento per data'}
            </p>
            <div className="space-y-2">
              {sortOptions.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSortByDateChange(key)}
                  className={
                    sortByDate === key
                      ? 'w-full justify-center px-3 py-2.5 rounded-xl bg-[#FFC107] text-black text-xs font-bold hover:brightness-95'
                      : 'w-full justify-center px-3 py-2.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-[#8e8e8e] text-xs font-semibold transition-colors'
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
