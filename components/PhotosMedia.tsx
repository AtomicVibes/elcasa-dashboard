'use client';

import { Camera, FileText, Shield, Layers } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import MediaUploadSection from '@/components/MediaUploadSection';
import type { LucideIcon } from 'lucide-react';

interface MediaType {
  id: string;
  icon: LucideIcon;
  translationKey: string;
}

const mediaTypes: MediaType[] = [
  { id: 'projectPhoto', icon: Camera, translationKey: 'media.types.projectPhoto' },
  { id: 'blueprint', icon: FileText, translationKey: 'media.types.blueprint' },
  { id: 'siteSnapshot', icon: Shield, translationKey: 'media.types.siteSnapshot' },
  { id: 'render', icon: Layers, translationKey: 'media.types.render' },
];

function MediaUploadCard({ icon: Icon, translationKey }: MediaType) {
  const { t } = useLanguage();

  return (
    <button
      className="bg-gray-50 dark:bg-[#1c1b1b] border border-gray-200 dark:border-[#3a3939] p-5 rounded-[8px] text-left flex flex-col justify-between h-48 group
                 hover:bg-gray-100 dark:hover:bg-[#262525] hover:-translate-y-0.5 hover:border-[#ffc107]
                 active:translate-y-0 active:bg-gray-50 dark:active:bg-[#1c1b1b]
                 transition-all duration-200 ease-out"
    >
      <div className="w-10 h-10 bg-gray-100 dark:bg-[#0e0e0e] rounded-lg flex items-center justify-center text-[#ffc107] mb-4">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3
          className="font-bold text-lg leading-tight text-gray-900 dark:text-white"
          data-i18n={`${translationKey}.title`}
        >
          {t(`${translationKey}.title`)}
        </h3>
        <p
          className="text-xs text-gray-500 dark:text-gray-400 mt-1"
          data-i18n={`${translationKey}.subtitle`}
        >
          {t(`${translationKey}.subtitle`)}
        </p>
      </div>
    </button>
  );
}

export default function PhotosMedia() {
  const { t } = useLanguage();

  return (
    <div className="flex-grow p-6 pb-24 max-w-4xl mx-auto w-full bg-white dark:bg-[#0e0e0e] text-gray-900 dark:text-white">
      <header className="mb-10">
        <div className="flex justify-between items-start">
          <div>
            <h1
              className="text-4xl font-extrabold tracking-tight mb-2 text-gray-900 dark:text-white"
              data-i18n="media.title"
            >
              {t('media.title')}
            </h1>
            <p
              className="text-gray-500 dark:text-gray-400 font-light max-w-md"
              data-i18n="media.subtitle"
            >
              {t('media.subtitle')}
            </p>
          </div>
        </div>
      </header>

      <section className="mb-12">
        <h2
          className="text-[11px] font-bold tracking-widest uppercase text-amber-600 dark:text-[#ffc107] mb-4"
          data-i18n="media.uploadTypes.title"
        >
          {t('media.uploadTypes.title')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mediaTypes.map((item) => (
            <MediaUploadCard key={item.id} {...item} />
          ))}
        </div>
      </section>

      <MediaUploadSection />
    </div>
  );
}
