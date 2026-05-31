"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import { getSupabase } from '@/app/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';

interface RequestItem {
  id: number;
  client_name: string;
  address: string;
  estimated_budget: string;
  status: string;
}

export default function RequestsIndex() {
  const { language } = useLanguage();
  const lang = language === 'en' ? 'EN' : 'IT';

  const [items, setItems] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function pullData() {
      const { data } = await getSupabase()
        .from('renovation_requests')
        .select('id, client_name, address, estimated_budget, status')
        .order('created_at', { ascending: false });
      if (data) setItems(data);
      setLoading(false);
    }
    pullData();
  }, []);

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-[#131313] dark:text-white">
      <Sidebar />

      <main className="ml-0 lg:ml-64 h-screen bg-white dark:bg-[#131313] p-6 pt-20 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            {lang === 'EN' ? 'Renovation Requests' : 'Richieste di Ristrutturazione'}
          </h1>
          <p className="text-zinc-600 dark:text-[#8e8e8e] text-sm mt-1">
            {lang === 'EN' ? `${items.length} total raw leads tracking active` : `${items.length} richieste totali attive`}
          </p>
        </div>

        {/* Data Container Grid Sheet */}
        <div className="bg-zinc-50 dark:bg-[#1c1b1b] rounded-xl border border-zinc-200 dark:border-neutral-800 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-sm text-zinc-600 dark:text-[#8e8e8e] animate-pulse">Loading items matrix...</div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-sm text-zinc-600 dark:text-[#8e8e8e]">No incoming submissions found.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-neutral-800 bg-zinc-50 dark:bg-[#1c1b1b] text-zinc-600 dark:text-[#8e8e8e] text-xs uppercase font-bold tracking-widest">
                  <th className="py-5 px-6">{lang === 'EN' ? 'Customer' : 'Cliente'}</th>
                  <th className="py-5 px-6">{lang === 'EN' ? 'Address' : 'Indirizzo'}</th>
                  <th className="py-5 px-6">Budget</th>
                  <th className="py-5 px-6">Status</th>
                  <th className="py-5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-neutral-800/60">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-100 dark:hover:bg-[#151515] transition-colors">
                    <td className="py-5 px-6 font-semibold text-zinc-800 dark:text-zinc-200">{item.client_name || 'Anonymous'}</td>
                    <td className="py-5 px-6 text-sm font-semibold text-zinc-800 dark:text-zinc-200">{item.address}</td>
                    <td className="py-5 px-6 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      {item.estimated_budget ? `€ ${Number(item.estimated_budget).toLocaleString()}` : '—'}
                    </td>
                    <td className="py-5 px-6">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-[#FFB800] border border-amber-500/20">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <Link href={`/dashboard/requests/${item.id}`} className="text-[#FFB800] text-xs font-bold hover:underline">
                        {lang === 'EN' ? 'Inspect File' : 'Ispeziona'} →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}