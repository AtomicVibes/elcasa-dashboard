'use client';

import Sidebar from '@/app/components/Sidebar';
import { useLanguage } from '@/context/LanguageContext';


export default function TimelineDashboardPage() {
  const { t, language } = useLanguage();

  const milestones = [
    { title: t('milestone1Title'), date: 'Apr 04, 2026', detail: t('milestone1Desc') },
    { title: t('milestone2Title'), date: 'May 12, 2026', detail: t('milestone2Desc') },
    { title: t('milestone3Title'), date: 'Jun 01, 2026', detail: t('milestone3Desc') },
    { title: t('milestone4Title'), date: 'Jul 20, 2026', detail: t('milestone4Desc') },
  ];




  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-[#131313] dark:text-white">
      <Sidebar />

      <main className="ml-0 lg:ml-64 h-screen bg-white dark:bg-[#131313] p-6 pt-20 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">

            <h1 className="mt-3 text-4xl font-black tracking-tight">{t('timeline')}</h1>
            <p className="text-zinc-600 dark:text-[#8e8e8e] text-xs mt-1">
              {language === 'it'
                ? 'Traccia le tappe del progresso della costruzione, le schedulazioni delle attività dei lavoratori e gli obiettivi di consegna.'
                : 'Track construction progress milestones, worker task schedules, and delivery targets.'}
            </p>


          </div>


          <section className="space-y-6">
            <div className="relative pl-8">
              <div className="absolute left-5 top-0 h-full w-px bg-neutral-800" />

              {milestones.map((item, index) => (
                <div key={item.title} className="relative flex gap-6 rounded-3xl border border-neutral-800/80 bg-zinc-50 dark:bg-[#1c1b1b] p-6 shadow-black/20">
                  <div className="absolute left-[-0.65rem] top-6 flex h-5 w-5 items-center justify-center rounded-full bg-[#FFB800] text-sm font-bold text-black shadow-lg shadow-black/20">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">{item.title}</h2>
                      <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-zinc-600 dark:text-[#8e8e8e]">
                        {item.date}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-[#8e8e8e]">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
