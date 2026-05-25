'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

import { supabase } from '@/app/lib/supabase';
import LanguageToggleDropdown from '@/components/LanguageToggle';



import { RequireAuth } from "@/app/components/RequireAuth";

export default function AdminDashboard() {
  return (
    <RequireAuth>
      <AdminDashboardInner />
    </RequireAuth>
  );
}

function AdminDashboardInner() {
const { language } = useLanguage();
  const lang = language.toUpperCase() as 'EN' | 'IT';
  const { user, loading } = useAuth();
  const [profileName, setProfileName] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) console.error('[Dashboard Profile Load Error]:', error);
          if (data?.full_name) setProfileName(data.full_name);
        });
    }
  }, [user?.id]);

  const greetingName = loading
    ? ''
    : profileName || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || '';

  const [totalRequests, setTotalRequests] = useState(0);

  useEffect(() => {
    async function getStats() {
      const { count } = await supabase
        .from('renovation_requests')
        .select('*', { count: 'exact', head: true });
      setTotalRequests(count || 0);
    }
    getStats();
  }, []);

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-[#131313] dark:text-white transition-colors duration-200">
      <Sidebar />

      <main className="ml-0 lg:ml-64 h-screen overflow-y-auto p-6 pt-20 sm:p-8 lg:p-12 transition-all duration-300 bg-white dark:bg-[#131313]">

        
        {/* Modern Top Header / Navbar Segment */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-zinc-200 dark:border-neutral-800/60">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none text-zinc-900 dark:text-white">

              {lang === 'EN' ? `Good morning${greetingName ? `, ${greetingName}` : ''}` : `Buongiorno${greetingName ? `, ${greetingName}` : ''}`}
            </h1>
            <p className="text-zinc-600 dark:text-[#8e8e8e] text-sm mt-1.5 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {lang === 'EN' ? "Here's today's summary — Saturday, May 16" : "Ecco il riepilogo di oggi — Sabato, 16 Maggio"}


            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative inline-block text-left">
              <LanguageToggleDropdown />

            </div>
            <Link 
              href="/admin/new-case" 
              className="flex-1 sm:flex-initial bg-[#FFB800] text-neutral-950 text-xs font-bold px-5 py-3 rounded-xl hover:bg-[#E5A500] transition-all shadow-lg shadow-[#FFB800]/10 hover:shadow-[#FFB800]/20 active:scale-95 text-center flex items-center justify-center gap-1.5"
            >
              <span>+</span>
              <span>{lang === 'EN' ? 'New Case File' : 'Nuovo Fascicolo'}</span>
            </Link>
          </div>
        </div>

        {/* Dynamic Analytics Dashboard Grid Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          
          {/* Card 1 */}
          <div className="group bg-zinc-50 p-6 rounded-2xl border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 dark:bg-[#1c1b1b] dark:border-neutral-800/80 dark:hover:bg-[#1A1A1A] dark:hover:border-neutral-700/90 transition-all duration-300 ease-out backdrop-blur-sm hover:-translate-y-0.5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-neutral-800/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <p className="text-xs font-bold text-zinc-600 dark:text-[#8e8e8e] uppercase tracking-widest">
              {lang === 'EN' ? 'Total Case Files' : 'Fascicoli Totali'}
            </p>
            <h3 className="text-4xl lg:text-5xl font-black mt-3 text-zinc-900 dark:text-white tracking-tight">{totalRequests}</h3>
            <span className="inline-flex items-center text-[11px] text-emerald-500 font-semibold mt-2 px-2 py-0.5 rounded-md bg-emerald-500/5 border border-emerald-500/10">
              +3 {lang === 'EN' ? 'this month' : 'questo mese'}
            </span>
          </div>

          {/* Card 2 */}
          <div className="group bg-zinc-50 p-6 rounded-2xl border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 dark:bg-[#1c1b1b] dark:border-neutral-800/80 dark:hover:bg-[#1A1A1A] dark:hover:border-neutral-700/90 transition-all duration-300 ease-out backdrop-blur-sm hover:-translate-y-0.5 relative overflow-hidden">
            <p className="text-xs font-bold text-zinc-600 dark:text-[#8e8e8e] uppercase tracking-widest">
              {lang === 'EN' ? 'Active Files' : 'Fascicoli Attivi'}
            </p>
            <h3 className="text-4xl lg:text-5xl font-black mt-3 text-zinc-900 dark:text-white tracking-tight">18</h3>
            <span className="inline-flex items-center text-[11px] text-zinc-500 dark:text-[#8e8e8e] font-medium mt-2 px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 dark:bg-neutral-800 dark:border-neutral-700/40">
              6 {lang === 'EN' ? 'completed' : 'completati'}
            </span>
          </div>

          {/* Card 3 */}
          <div className="group bg-zinc-50 p-6 rounded-2xl border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 dark:bg-[#1c1b1b] dark:border-neutral-800/80 dark:hover:bg-[#1A1A1A] dark:hover:border-neutral-700/90 transition-all duration-300 ease-out backdrop-blur-sm hover:-translate-y-0.5 relative overflow-hidden">
            <p className="text-xs font-bold text-zinc-600 dark:text-[#8e8e8e] uppercase tracking-widest">
              {lang === 'EN' ? 'Pending Uploads' : 'Caricamenti Pendenti'}
            </p>
            <h3 className="text-4xl lg:text-5xl font-black mt-3 text-zinc-900 dark:text-white tracking-tight">7</h3>
            <span className="inline-flex items-center text-[11px] text-amber-500 font-medium mt-2 px-2 py-0.5 rounded-md bg-amber-500/5 border border-amber-500/10">
              3 {lang === 'EN' ? 'new today' : 'nuovi oggi'}
            </span>
          </div>

          {/* Card 4 */}
          <div className="group bg-zinc-50 p-6 rounded-2xl border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 dark:bg-[#1c1b1b] dark:border-neutral-800/80 dark:hover:bg-[#1A1A1A] dark:hover:border-neutral-700/90 transition-all duration-300 ease-out backdrop-blur-sm hover:-translate-y-0.5 relative overflow-hidden shadow-sm">
            <p className="text-xs font-bold text-zinc-600 dark:text-[#8e8e8e] uppercase tracking-widest">
              {lang === 'EN' ? 'Monthly Revenue' : 'Ricavo Mensile'}
            </p>
            <h3 className="text-4xl lg:text-5xl font-black mt-3 text-[#FFB800] tracking-tight">€ 48.200</h3>
            <span className="inline-flex items-center text-[11px] text-emerald-500 font-semibold mt-2 px-2 py-0.5 rounded-md bg-emerald-500/5 border border-emerald-500/10">
              +12% {lang === 'EN' ? 'vs last month' : 'rispetto al mese scorso'}
            </span>
          </div>
        </div>

        {/* Grid Split Content Core Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Table Feed Display Section */}
          <div className="lg:col-span-2 bg-zinc-50 rounded-2xl border border-zinc-200 p-6 shadow-xl dark:bg-[#1c1b1b] dark:border-neutral-800/80">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
                {lang === 'EN' ? 'Recent Case Files' : 'Fascicoli Recenti'}
              </h2>
              <Link 
                href="/admin/requests" 
                className="text-[#FFB800] text-xs font-bold hover:text-[#E5A500] transition-colors flex items-center gap-1 group/link"
              >
                <span>{lang === 'EN' ? 'View all' : 'Vedi tutti'}</span>
                <span className="transform group-hover/link:translate-x-0.5 transition-transform">→</span>
              </Link>
            </div>
            
            <div className="space-y-3">
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 hover:scale-[1.01] dark:bg-[#0F0F0F] dark:border-neutral-800/60 dark:hover:bg-[#161616] transition-all duration-300 shadow-sm flex justify-between items-center group/row">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 font-mono text-xs dark:bg-[#141414] dark:border-neutral-800 dark:text-[#8e8e8e] group-hover/row:border-neutral-700 transition-colors">
                    VR
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-zinc-900 dark:text-white group-hover/row:text-[#FFB800] transition-colors">Ristrutturazione Via Roma 12</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">Milan, Italy</p>
                  </div>
                </div>
                <span className="text-[11px] uppercase tracking-wider font-extrabold bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full border border-emerald-500/20 shadow-sm dark:text-emerald-400">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Activity Logs Timeline Feed Column Panel */}
          <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-6 shadow-xl dark:bg-[#1c1b1b] dark:border-neutral-800/80">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight mb-6">
              {lang === 'EN' ? 'Recent Activity' : 'Attività Recente'}
            </h2>
            
            <div className="relative border-l border-zinc-200 pl-4 ml-2 space-y-6 dark:border-neutral-800/80">
              <div className="relative group">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#FFB800] border-2 border-white dark:border-[#141414] group-hover:scale-125 transition-transform" />
                <p className="text-xs text-zinc-700 leading-relaxed dark:text-[#8e8e8e]">
                  <span className="text-zinc-900 font-semibold dark:text-white">5 new photos</span> uploaded to Via Roma 12
                  <span className="text-zinc-500 block text-[10px] mt-1">3m ago</span>
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}