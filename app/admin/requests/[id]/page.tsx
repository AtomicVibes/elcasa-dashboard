"use client";
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import { useLanguage } from '@/context/LanguageContext';
import { getSupabase } from '@/app/lib/supabase';
import toast from 'react-hot-toast';

interface FullRequest {
  id: number;
  client_name: string;
  address: string;
  work_type: string;
  cleaned_description: string;
  estimated_budget: string;
  budget_feasibility: string;
  photo_analysis_notes: string;
  uploaded_photo_url: string;
  status: string;
}

export default function RequestDetailView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { language } = useLanguage();
  const lang = language === 'en' ? 'EN' : 'IT';

  const router = useRouter();
  
  const [data, setData] = useState<FullRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function loadItem() {
      const { data: item } = await getSupabase()
        .from('renovation_requests')
        .select('*')
        .eq('id', id)
        .single();
      if (item) setData(item);
      setLoading(false);
    }
    loadItem();
  }, [id]);

  const handleApproveToCase = async () => {
    setActionLoading(true);
    // Simulating approval status mutation cascade
    const { error } = await getSupabase()
      .from('renovation_requests')
      .update({ status: 'Approved' })
      .eq('id', id);

    setActionLoading(false);
    if (!error) {
      toast.success(lang === 'EN' ? 'Case file successfully created!' : 'Fascicolo creato con successo!');
      router.push('/admin/requests');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-white items-center justify-center text-sm text-zinc-900 dark:bg-[#131313] dark:text-white animate-pulse">
        Decompressing schema vectors...
      </div>
    );
  }

  if (!data) return <div className="p-12 text-center text-zinc-900 dark:text-white">Project record row matrix lost or unavailable.</div>;

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-[#131313] dark:text-white">
      <Sidebar />

      <main className="ml-0 lg:ml-64 h-screen bg-white dark:bg-[#131313] p-6 pt-20 sm:p-8 lg:p-12 overflow-y-auto">
        {/* Header Ribbon bar */}
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-zinc-200 dark:border-neutral-800">
          <div>
            <span className="text-[10px] font-bold uppercase bg-amber-500/10 text-[#FFB800] px-3 py-1 rounded-full border border-amber-500/20">
              {data.status}
            </span>
            <h1 className="text-3xl font-black mt-3 text-zinc-900 dark:text-white">{data.client_name}</h1>
            <p className="text-zinc-600 dark:text-[#8e8e8e] text-xs mt-1">ID Hash reference key: #{data.id}</p>
          </div>

          <button
            onClick={handleApproveToCase}
            disabled={actionLoading || data.status === 'Approved'}
            className="bg-[#FFB800] text-black font-bold text-xs px-5 py-2.5 rounded-lg hover:bg-[#E5A500] transition-colors disabled:opacity-40"
          >
            {actionLoading ? 'Writing...' : data.status === 'Approved' ? 'Already Approved' : lang === 'EN' ? 'Convert to Active Case File' : 'Approva in Fascicolo Attivo'}
          </button>
        </div>

        {/* Content Splitting Grid Panels */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          <div className="xl:col-span-2 space-y-6">
            
            {/* Raw Details sheet info block */}
            <div className="bg-zinc-50 dark:bg-[#1c1b1b] border border-zinc-200 dark:border-neutral-800 rounded-xl p-6">
              <h3 className="text-[10px] font-bold text-zinc-600 dark:text-[#8e8e8e] uppercase tracking-widest mb-4">Core Metadata</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-zinc-600 dark:text-[#8e8e8e] text-xs font-semibold">Site Address Location</p>
                  <p className="font-bold text-zinc-900 dark:text-white mt-1">{data.address}</p>
                </div>
                <div>
                  <p className="text-zinc-600 dark:text-[#8e8e8e] text-xs font-semibold">User Declared Budget Allocation</p>
                  <p className="font-bold text-[#FFB800] mt-1">€ {Number(data.estimated_budget).toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-neutral-800/60">
                <p className="text-zinc-600 dark:text-[#8e8e8e] text-xs font-semibold">Cleaned Core Scope Specification</p>
                <p className="text-zinc-800 dark:text-zinc-200 text-sm mt-3 leading-relaxed bg-zinc-50 dark:bg-[#1c1b1b] p-4 rounded-xl border border-zinc-200 dark:border-neutral-800/60">
                  {data.cleaned_description}
                </p>
              </div>
            </div>

            {/* Uploaded Site Images Frame container */}
            <div className="bg-zinc-50 dark:bg-[#1c1b1b] border border-zinc-200 dark:border-neutral-800 rounded-xl p-6">
              <h3 className="text-[10px] font-bold text-zinc-600 dark:text-[#8e8e8e] uppercase tracking-widest mb-4">Inspection Documentation Photos</h3>
              {data.uploaded_photo_url ? (
                <div className="inline-block rounded-xl overflow-hidden border border-zinc-200 dark:border-neutral-800 bg-zinc-50 dark:bg-[#1c1b1b] p-2">
                  <img 
                    src={data.uploaded_photo_url} 
                    alt="Inspection Source Entry" 
                    className="max-w-md max-h-64 object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="p-8 text-center text-xs border border-dashed border-zinc-300 dark:border-neutral-800 rounded-xl text-zinc-600 dark:text-[#8e8e8e]">
                  No visual assets appended to this database submission row.
                </div>
              )}
            </div>
          </div>

          {/* AI Intelligence Assessment Panel Frame */}
          <div className="bg-gradient-to-b from-[#1E1E1E] to-[#171510] border border-[#FFB800]/20 rounded-xl p-6 sticky top-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#FFB800] animate-pulse" />
              <h3 className="text-[10px] font-bold text-[#FFB800] uppercase tracking-widest">Gemini Engine Analysis</h3>
            </div>
            <div className="text-xs text-zinc-600 dark:text-[#8e8e8e] mb-4 border-b border-zinc-200 dark:border-neutral-800 pb-3 flex justify-between">
              <span>Risk Metric Matrix:</span>
              <span className={`font-black uppercase ${data.budget_feasibility === 'Realistic' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {data.budget_feasibility || 'Unassessed'}
              </span>
            </div>
            <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed bg-zinc-50 dark:bg-[#1c1b1b]/80 border border-zinc-200 dark:border-neutral-800/80 p-4 rounded-xl font-mono">
              {data.photo_analysis_notes || 'Awaiting image analysis trigger processing parameters.'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}