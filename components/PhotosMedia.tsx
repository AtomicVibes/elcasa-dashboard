'use client';

import { Camera, FileText, Shield, Layers, Upload } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
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

interface RecentAsset {
  alt: string;
  src: string;
  fileName: string;
  timeKey: string;
}

const recentAssets: RecentAsset[] = [
  {
    alt: 'Skyscraper Construction',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAdjvtB582G6eXEwPtG3E-C4rh2EY5hI-KXmxGyNavEt6dArOkwl-mL_SJr4JEIx1jn3nH1wnnkzC6oV5tW9DEuPaXydQWQ9FHQ-TsVwKrvOK7qWNIGN7AAXGWK2CnR4jkAUaTggZeQ0DVzUT2dEL81i7IMrAYSGVyWeREI0S2SaTJeM_pA3iyItM34VbssRQDi5rsaXOSMxKhhYpM-4SHM1m18TiESg8AL9fds-A2SzEPZywHpWhJkmP-edHcb1JCeoyRg92oaDc',
    fileName: 'STRUCT_042.jpg',
    timeKey: 'media.time.2h',
  },
  {
    alt: 'Blueprint & Hard Hat',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJBWKNO7KpnV2h0LKIy6DaIia9rABQac3cFCyzHPftah9sgqTf4yE7PjT7vPioTKQ4XYS3S7RGlGb7BeRAjjSMeSEmV43IiWXSeRzS7PWsOBhLU1Fp7fmFuLj6AHLWAfG2Z29QzvgZqiPT9P60EIFUUZvummeQC_4PRv8AV3LyXwWP8TNuB_7QVj3VbVevipmak5FzkAY3dPIj_WQDYk86dXHdVgWdQDw3cUWrywEhgGvd_Eusog_zkSLJfH_ymRBRkknemhrHW8Y',
    fileName: 'BP_REF_SITE.pdf',
    timeKey: 'media.time.4h',
  },
  {
    alt: 'Crane at Sunset',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYd-YMS5PJl1qQXHiTsu3RdCW2PTwx0__vBLMSXmGtovTpX0fVQDmgfnuOfzLlc63VNC2O9_p9RXYZTrOxOLcD3djkM4J2kxiAxMI95w_DAPJjLIbWK72WW6va6Tv7QBfxxM91gY9k2yqK6hmeo0KuCQPRekL2vhlOzIaMYAUghYkjO4Zs3dNF9fCYQd6_V5NyHg4jzFVj2WZEqwO6SYxDiCqMt5KDPTe1Za__9ZbJMQzpdt9renLkAOIiv_LSLttJC2PKtyM6Vts',
    fileName: 'DAILY_SITE_09.jpg',
    timeKey: 'media.time.yesterday',
  },
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

      <section className="mb-12">
        <div
          className="border-2 border-dashed border-gray-300 dark:border-[#3a3939] bg-gray-50 dark:bg-[#131313] rounded-[8px] p-12 text-center flex flex-col items-center justify-center cursor-pointer
                       hover:border-[#ffc107] hover:bg-[#ffc107]/5 dark:hover:bg-[#ffc107]/[0.05] transition-colors duration-300"
        >
          <Upload className="mb-4 w-10 h-10 text-[#ffc107]" strokeWidth={1.5} />
          <p
            className="text-lg font-semibold text-gray-900 dark:text-white"
            data-i18n="media.dropzone.title"
          >
            {t('media.dropzone.title')}
          </p>
          <p
            className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic"
            data-i18n="media.dropzone.subtitle"
          >
            {t('media.dropzone.subtitle')}
          </p>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex justify-between items-end mb-6">
          <h2
            className="text-[11px] font-bold tracking-widest uppercase text-amber-600 dark:text-[#ffc107]"
            data-i18n="media.recent.title"
          >
            {t('media.recent.title')}
          </h2>
          <a
            href="#"
            className="text-xs text-amber-600 dark:text-[#ffc107] border-b border-amber-600/30 dark:border-[#ffc107]/30 pb-0.5 hover:border-amber-600 dark:hover:border-[#ffc107] transition-all"
            data-i18n="media.recent.viewAll"
          >
            {t('media.recent.viewAll')}
          </a>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {recentAssets.map((asset) => (
            <div
              key={asset.fileName}
              className="relative aspect-square bg-gray-50 dark:bg-[#1c1b1b] rounded-[8px] overflow-hidden border border-gray-200 dark:border-[#3a3939] group"
            >
              <Image
                alt={asset.alt}
                src={asset.src}
                fill
                className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                sizes="(max-width: 768px) 33vw, 25vw"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gray-900/70 dark:bg-[#0e0e0e]/70 p-2 flex justify-between items-end backdrop-blur-sm">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#ffc107] truncate">{asset.fileName}</span>
                  <span
                    className="text-[8px] text-gray-300 dark:text-gray-400"
                    data-i18n={asset.timeKey}
                  >
                    {t(asset.timeKey)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
