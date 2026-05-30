'use client';

import { useMemo, useState } from 'react';
import Sidebar from '@/app/components/Sidebar';
import { useLanguage } from '@/context/LanguageContext';
import LeaveRequestDashboard from '@/components/LeaveRequestDashboard';
import type { LeaveRequest } from '@/components/LeaveRequestDashboard';

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
    const statusLabel = (s: LeaveRequest['status']) => getStatusBadgeLabel(s);

    const headers = ['Employee Name', 'Leave Type', 'Start Date', 'End Date', 'Total Days', 'Status'];

    const csvEscape = (value: string | number) => {
      const str = String(value ?? '');
      if (/[",\n\r]/.test(str)) return `"${str.replaceAll('"', '""')}"`;
      return str;
    };

    const csv = [
      headers.join(','),
      ...rows.map((r) =>
        [r.employeeName, getLeaveTypeLabel(r.leaveType), formatDate(r.startDate), formatDate(r.endDate), r.duration, statusLabel(r.status)]
          .map(csvEscape)
          .join(','),
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
    const labels: Record<LeaveRequest['leaveType'], { en: string; it: string }> = {
      vacation: { en: 'Vacation', it: 'Vacanza' },
      sick: { en: 'Sick Leave', it: 'Malattia' },
      personal: { en: 'Personal', it: 'Personale' },
      bereavement: { en: 'Bereavement', it: 'Luto' },
    };
    return lang === 'IT' ? labels[type].it : labels[type].en;
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

          <LeaveRequestDashboard
            requests={filteredSortedRequests}
            stats={stats}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
            sortByDate={sortByDate}
            onSortByDateChange={setSortByDate}
            onStatusChange={handleStatusChange}
            onExportCsv={handleExportCsv}
            getLeaveTypeLabel={getLeaveTypeLabel}
            formatDate={formatDate}
            getStatusBadgeLabel={getStatusBadgeLabel}
            t={t}
            lang={lang}
          />
        </div>
      </main>
    </div>
  );
}
