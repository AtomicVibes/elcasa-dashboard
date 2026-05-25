'use client';

import { useMemo, useState } from 'react';
import Sidebar from '@/app/components/Sidebar';
import { Calendar, CheckCircle, Filter, XCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLanguage } from '@/context/LanguageContext';

interface LeaveRequest {
  id: number;
  employeeName: string;
  employeeInitials: string;
  leaveType: 'vacation' | 'sick' | 'personal' | 'bereavement';
  startDate: string;
  endDate: string;
  duration: number;
  status: 'approved' | 'pending' | 'rejected';
}


const mockLeaveRequests: LeaveRequest[] = [
  {
    id: 1,
    employeeName: 'Luca Rossi',
    employeeInitials: 'LR',
    leaveType: 'vacation',
    startDate: '2026-06-10',
    endDate: '2026-06-15',
    duration: 6,
    status: 'pending',
  },
  {
    id: 2,
    employeeName: 'Giulia Bianchi',
    employeeInitials: 'GB',
    leaveType: 'sick',
    startDate: '2026-06-05',
    endDate: '2026-06-07',
    duration: 3,
    status: 'approved',
  },
  {
    id: 3,
    employeeName: 'Marco Verdi',
    employeeInitials: 'MV',
    leaveType: 'personal',
    startDate: '2026-06-20',
    endDate: '2026-06-20',
    duration: 1,
    status: 'pending',
  },
  {
    id: 4,
    employeeName: 'Sara Neri',
    employeeInitials: 'SN',
    leaveType: 'bereavement',
    startDate: '2026-05-28',
    endDate: '2026-06-01',
    duration: 5,
    status: 'rejected',
  },
  {
    id: 5,
    employeeName: 'Andrea Costa',
    employeeInitials: 'AC',
    leaveType: 'vacation',
    startDate: '2026-07-01',
    endDate: '2026-07-15',
    duration: 15,
    status: 'pending',
  },
  {
    id: 6,
    employeeName: 'Elena Russo',
    employeeInitials: 'ER',
    leaveType: 'sick',
    startDate: '2026-05-20',
    endDate: '2026-05-22',
    duration: 3,
    status: 'approved',
  },
];

const leaveTypeLabels: Record<LeaveRequest['leaveType'], { en: string; it: string }> = {
  vacation: { en: 'Vacation', it: 'Vacanza' },
  sick: { en: 'Sick Leave', it: 'Malattia' },
  personal: { en: 'Personal', it: 'Personale' },
  bereavement: { en: 'Bereavement', it: 'Luto' },
};

export default function LeaveRequestsPage() {
  const { t, language } = useLanguage();
  const lang = language.toUpperCase() as 'EN' | 'IT';

  const [requests, setRequests] = useState<LeaveRequest[]>(mockLeaveRequests);

  const [filterStatus, setFilterStatus] = useState<'all' | LeaveRequest['status']>('all');
  const [sortByDate, setSortByDate] = useState<'newest' | 'oldest'>('newest');

  const filteredSortedRequests = useMemo(() => {
    const next = requests
      .filter((r) => (filterStatus === 'all' ? true : r.status === filterStatus))
      .slice()
      .sort((a, b) => {
        const aTime = new Date(a.startDate).getTime();
        const bTime = new Date(b.startDate).getTime();
        return sortByDate === 'newest' ? bTime - aTime : aTime - bTime;
      });

    return next;
  }, [requests, filterStatus, sortByDate]);

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  };

  const getStatusBadgeLabel = (status: LeaveRequest['status']) => {
    if (status === 'approved') return t('leaveRequests.statusBadge.approved');
    if (status === 'pending') return t('leaveRequests.statusBadge.pending');
    return t('leaveRequests.statusBadge.rejected');
  };

  const handleExportCsv = () => {
    const rows = filteredSortedRequests;

    const statusLabel = (status: LeaveRequest['status']) => getStatusBadgeLabel(status);


    const headers = [
      'Employee Name',
      'Leave Type',
      'Start Date',
      'End Date',
      'Total Days',
      'Status',
    ];



    const csvEscape = (value: string | number) => {
      const str = String(value ?? '');
      if (/[",\n\r]/.test(str)) return `"${str.replaceAll('"', '""')}"`;
      return str;
    };

    const csv = [
      headers.join(','),
      ...rows.map((r) =>
        [
          r.employeeName,
          getLeaveTypeLabel(r.leaveType),
          formatDate(r.startDate),
          formatDate(r.endDate),
          r.duration,
          statusLabel(r.status),
        ]
          .map(csvEscape)
          .join(',')
      ),
    ].join('\n');

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const fileName = `leave_requests_export_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.csv`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleStatusChange = (id: number, newStatus: 'approved' | 'rejected') => {

    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
  };

  const getLeaveTypeLabel = (type: LeaveRequest['leaveType']) => {
    const labels = leaveTypeLabels[type];
    return lang === 'IT' ? labels.it : labels.en;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(lang === 'IT' ? 'it-IT' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-[#131313] dark:text-white">
      <Sidebar />

      <main className="ml-0 lg:ml-64 h-screen bg-white dark:bg-[#131313] p-6 pt-20 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="mt-3 text-4xl font-black tracking-tight">{t('leaveRequests.title')}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-[#8e8e8e]">{t('leaveRequests.subtitle')}</p>
          </header>

          <div className="flex items-center justify-between mb-6">
            <div />
            <div className="flex items-center gap-3">

              <Popover>
                <PopoverTrigger asChild>
                  <button className="inline-flex items-center gap-2 bg-zinc-50 dark:bg-[#1c1b1b] border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all">
                    <Filter className="w-4 h-4" />
                    <span>{t('leaveRequests.filterBtn')}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="w-[320px] p-3 rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#1c1b1b] text-zinc-900 dark:text-white"
                >
                  <div className="space-y-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-600 dark:text-[#8e8e8e]">
                        {lang === 'IT' ? 'Stato' : 'Status'}
                      </p>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {([
                          ['all', lang === 'IT' ? 'Tutti gli Stati' : 'All Statuses'],
                          ['pending', lang === 'IT' ? 'In Attesa' : 'Pending'],
                          ['approved', lang === 'IT' ? 'Approvato' : 'Approved'],
                          ['rejected', lang === 'IT' ? 'Rifiutato' : 'Rejected'],
                        ] as const).map(([key, label]) => {
                          const active = filterStatus === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setFilterStatus(key)}
                              className={
                                active
                                  ? 'px-3 py-2 rounded-lg bg-[#FFC107] text-black text-xs font-bold hover:brightness-95'
                                  : 'px-3 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-[#8e8e8e] text-xs font-semibold dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-300 dark:hover:bg-zinc-800/60 transition-colors'
                              }
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-600 dark:text-[#8e8e8e]">
                        {lang === 'IT' ? 'Ordinamento per data' : 'Sort by Date'}
                      </p>
                      <div className="mt-2 grid grid-cols-1 gap-2">
                        {([
                          ['newest', lang === 'IT' ? 'Più recenti' : 'Newest First'],
                          ['oldest', lang === 'IT' ? 'Più vecchi' : 'Oldest First'],
                        ] as const).map(([key, label]) => {
                          const active = sortByDate === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setSortByDate(key)}
                              className={
                                active
                                  ? 'w-full justify-center px-3 py-2 rounded-lg bg-[#FFC107] text-black text-xs font-bold hover:brightness-95'
                                  : 'w-full justify-center px-3 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-[#8e8e8e] text-xs font-semibold dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-300 dark:hover:bg-zinc-800/60 transition-colors'
                              }
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <button
                onClick={handleExportCsv}
                className="inline-flex items-center gap-2 bg-[#FFB800] text-neutral-950 font-bold px-4 py-2.5 rounded-xl shadow-md hover:brightness-95 transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>{t('leaveRequests.exportBtn')}</span>
              </button>

            </div>
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-zinc-50 dark:bg-[#1c1b1b] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">{t('leaveRequests.total')}</p>
              <h3 className="text-4xl lg:text-5xl font-black mt-3 text-zinc-900 dark:text-white tracking-tight">{stats.total}</h3>
              <span className="inline-flex items-center text-[11px] text-zinc-600 dark:text-[#8e8e8e] font-medium mt-2 px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 dark:bg-neutral-800 dark:border-neutral-700/40">
                All time
              </span>
            </div>
            <div className="bg-zinc-50 dark:bg-[#1c1b1b] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">{t('leaveRequests.pending')}</p>
              <h3 className="text-4xl lg:text-5xl font-black mt-3 text-amber-400 tracking-tight">{stats.pending}</h3>
              <span className="inline-flex items-center text-[11px] text-amber-500 font-medium mt-2 px-2 py-0.5 rounded-md bg-amber-500/5 border border-amber-500/10">
                Awaiting action
              </span>
            </div>
            <div className="bg-zinc-50 dark:bg-[#1c1b1b] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">{t('leaveRequests.approved')}</p>
              <h3 className="text-4xl lg:text-5xl font-black mt-3 text-emerald-400 tracking-tight">{stats.approved}</h3>
              <span className="inline-flex items-center text-[11px] text-emerald-500 font-medium mt-2 px-2 py-0.5 rounded-md bg-emerald-500/5 border border-emerald-500/10">
                Confirmed
              </span>
            </div>
            <div className="bg-zinc-50 dark:bg-[#1c1b1b] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">{t('leaveRequests.rejected')}</p>
              <h3 className="text-4xl lg:text-5xl font-black mt-3 text-red-400 tracking-tight">{stats.rejected}</h3>
              <span className="inline-flex items-center text-[11px] text-red-500 font-medium mt-2 px-2 py-0.5 rounded-md bg-red-500/5 border border-red-500/10">
                Denied
              </span>
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-[#1c1b1b] rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#1c1b1b] text-zinc-600 dark:text-[#8e8e8e] text-xs uppercase font-bold tracking-widest">
                  <th className="py-5 px-6">{t('leaveRequests.tableHead.employee')}</th>
                  <th className="py-5 px-6">{t('leaveRequests.tableHead.leaveType')}</th>
                  <th className="py-5 px-6">{t('leaveRequests.tableHead.duration')}</th>
                  <th className="py-5 px-6">{t('leaveRequests.tableHead.status')}</th>
                  <th className="py-5 px-6 text-right">{t('leaveRequests.tableHead.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredSortedRequests.map((request) => (

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
                        <Calendar className="w-4 h-4 text-zinc-600 dark:text-[#8e8e8e]" />
                        <span>
                          {formatDate(request.startDate)} - {formatDate(request.endDate)}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-600 dark:text-[#8e8e8e] ml-6">{request.duration} days</span>
                    </td>
                    <td className="py-5 px-6">
                      {request.status === 'approved' && (
                        <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {t('leaveRequests.statusBadge.approved')}
                        </span>
                      )}
                      {request.status === 'pending' && (
                        <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {t('leaveRequests.statusBadge.pending')}
                        </span>
                      )}
                      {request.status === 'rejected' && (
                        <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                          {t('leaveRequests.statusBadge.rejected')}
                        </span>
                      )}
                    </td>
                    <td className="py-5 px-6 text-right">
                      {request.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleStatusChange(request.id, 'approved')}
                            className="inline-flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{t('leaveRequests.action.approve')}</span>
                          </button>
                          <button
                            onClick={() => handleStatusChange(request.id, 'rejected')}
                            className="inline-flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{t('leaveRequests.action.reject')}</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-600 dark:text-[#8e8e8e]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredSortedRequests.length === 0 && (

                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-zinc-600 dark:text-[#8e8e8e]">
                      {t('leaveRequests.noRequests')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}