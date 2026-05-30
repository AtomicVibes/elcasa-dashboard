"use client";
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import { useLanguage } from '@/context/LanguageContext';
import { getSupabase } from '@/app/lib/supabase';
import toast from 'react-hot-toast';

export default function NewCaseCreationForm() {
  const { language } = useLanguage();
  const lang = language === 'en' ? 'EN' : 'IT';

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    via: '',
    citta: '',
    type: 'Renovation',
    desc: ''
  });

  const runCreationPipeline = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await getSupabase()
      .from('renovation_requests')
      .insert([
        {
          client_name: form.name,
          address: `${form.via}, ${form.citta}`,
          work_type: form.type,
          cleaned_description: form.desc,
          status: 'Pending Review',
          budget_feasibility: 'Realistic',
          estimated_budget: '0'
        }
      ]);

    setLoading(false);
    if (error) {
      toast.error(`Database rejected entry stream: ${error.message}`);
    } else {
      router.push('/admin/requests');
    }
  };

  return (
    <div className="bg-white text-zinc-900 dark:bg-[#131313] dark:text-white min-h-screen">
      <Sidebar />

      <main className="ml-0 lg:ml-64 h-screen overflow-y-auto p-6 pt-20 sm:p-8 lg:p-12 lg:pt-12 bg-white dark:bg-[#131313]">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            {lang === 'EN' ? 'Create New Project Record' : 'Crea Nuovo Record Progetto'}
          </h1>
        </div>

        <form onSubmit={runCreationPipeline} className="max-w-2xl bg-zinc-50 dark:bg-[#1c1b1b] border border-neutral-800 rounded-xl p-8 space-y-5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-[#8e8e8e] mb-2">
              {lang === 'EN' ? 'Client Identification Name' : 'Nome Identificativo Cliente'}
            </label>
            <input 
              type="text" required placeholder="e.g. Mario Rossi"
              className="w-full bg-white dark:bg-zinc-800 border border-neutral-800 rounded-lg p-3 text-sm focus:outline-none focus:border-[#FFB800] text-zinc-900 dark:text-white"
              value={form.name} onChange={e => setForm({...form, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-[#8e8e8e] mb-2">Street Address</label>
              <input 
                type="text" required placeholder="e.g. Via Torino 4"
                className="w-full bg-white dark:bg-zinc-800 border border-neutral-800 rounded-lg p-3 text-sm focus:outline-none focus:border-[#FFB800] text-zinc-900 dark:text-white"
                value={form.via} onChange={e => setForm({...form, via: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-[#8e8e8e] mb-2">City</label>
              <input 
                type="text" required placeholder="e.g. Milano"
                className="w-full bg-white dark:bg-zinc-800 border border-neutral-800 rounded-lg p-3 text-sm focus:outline-none focus:border-[#FFB800] text-zinc-900 dark:text-white"
                value={form.citta} onChange={e => setForm({...form, citta: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-[#8e8e8e] mb-2">Classification Classification</label>
            <select 
              className="w-full bg-white dark:bg-zinc-800 border border-neutral-800 rounded-lg p-3 text-sm focus:outline-none focus:border-[#FFB800] text-zinc-900 dark:text-white"
              value={form.type} onChange={e => setForm({...form, type: e.target.value})}
            >
              <option value="Renovation">Renovation</option>
              <option value="Structural Modification">Structural Modification</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-[#8e8e8e] mb-2">Scope Summary Narrative</label>
            <textarea 
              rows={4} placeholder="Input project structural parameters..."
              className="w-full bg-white dark:bg-zinc-800 border border-neutral-800 rounded-lg p-3 text-sm focus:outline-none focus:border-[#FFB800] text-zinc-900 dark:text-white resize-none"
              value={form.desc} onChange={e => setForm({...form, desc: e.target.value})}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 rounded-xl border border-neutral-700 bg-[#B71C1C] text-[#212121] dark:text-[#FFEBEE] hover:opacity-90 transition-colors duration-200 text-sm font-semibold"
            >
              {lang === 'EN' ? 'Cancel' : 'Annulla'}
            </button>

            <button 
              type="submit" disabled={loading}
              className="bg-[#FFB800] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#e5a500] transition-colors disabled:opacity-40"
            >
              {loading ? 'Submitting Engine Streams...' : lang === 'EN' ? 'Commit Record' : 'Invia Record'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}