'use client';

import Sidebar from '@/app/components/Sidebar';
import { useLanguage } from '@/context/LanguageContext';

export default function CustomersDashboardPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-[#131313] dark:text-white">
      <Sidebar />

      <main className="ml-0 lg:ml-64 h-screen bg-white dark:bg-[#131313] p-6 pt-20 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <h1 className="mt-3 text-4xl font-black tracking-tight">{t('customersRegistry')}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-[#8e8e8e]">{t('primaryRenovationClient')}</p>
          </div>

          <section className="rounded-[32px] border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#1c1b1b] p-8 shadow-black/20">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">{t('customerContact')}</h2>
                </div>

                <span className="rounded-full bg-[#FFB800]/15 px-3 py-1 text-xs uppercase tracking-[0.24em] text-[#FFB800]">
                  {t('active')}
                </span>
              </div>

              <div className="rounded-3xl border border-neutral-700/90 bg-zinc-50 dark:bg-[#1c1b1b] p-6 shadow-black/20">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#FFB800]/10 text-[#FFB800] text-xl font-bold">
                      A
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-zinc-900 dark:text-white">Achref</p>
                      <p className="text-sm text-zinc-600 dark:text-[#8e8e8e]">Lead renovation client</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-zinc-600 dark:text-[#8e8e8e]">{t('email')}</p>
                    <p className="mt-1 text-base font-semibold text-zinc-900 dark:text-white">Achref@gmail.com</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl bg-zinc-50 dark:bg-[#1c1b1b] p-4 text-sm">
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-600 dark:text-[#8e8e8e]">{t('role')}</p>
                    <p className="mt-2 text-zinc-900 dark:text-white font-semibold">{t('roleClientDecisionMaker')}</p>
                  </div>

                  <div className="rounded-3xl bg-zinc-50 dark:bg-[#1c1b1b] p-4 text-sm">
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-600 dark:text-[#8e8e8e]">{t('project')}</p>
                    <p className="mt-2 text-zinc-900 dark:text-white font-semibold">Via Roma 12 Renovation</p>
                  </div>

                  <div className="rounded-3xl bg-zinc-50 dark:bg-[#1c1b1b] p-4 text-sm">
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-600 dark:text-[#8e8e8e]">{t('statusLabel')}</p>
                    <p className="mt-2 text-zinc-900 dark:text-white font-semibold">{t('contractActive')}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

