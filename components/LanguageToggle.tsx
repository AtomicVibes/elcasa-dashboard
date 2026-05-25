"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { useLanguage } from '@/context/LanguageContext';

export default function LanguageToggleDropdown() {

  const { language, setLanguage } = useLanguage();

  const lang: 'EN' | 'IT' = language === 'en' ? 'EN' : 'IT';

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const languageOptions = useMemo(
    () =>
      [
        { key: 'en' as const, langKey: 'EN' as const, label: 'English', icon: '/assets/language-icons/EN.png' },
        { key: 'it' as const, langKey: 'IT' as const, label: 'Italiano', icon: '/assets/language-icons/IT.png' },
      ],
    []
  );

  const active = useMemo(() => languageOptions.find((o) => o.langKey === lang) ?? languageOptions[0], [lang, languageOptions]);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, []);

  function applyLanguage(next: typeof active) {
    setLanguage(next.key);

    setDropdownOpen(false);
  }

  return (
    <div ref={rootRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setDropdownOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-zinc-100 border border-zinc-200 dark:bg-[#141414] dark:hover:bg-neutral-800/80 dark:border-neutral-800/60 rounded-xl transition-all duration-200 text-zinc-700 dark:text-neutral-200 text-xs font-semibold focus:outline-none"
      >
        <img src={active.icon} alt={active.label} className="w-5 h-3.5 object-cover rounded-sm shadow-sm" />
        <span className="uppercase tracking-wider">{active.langKey}</span>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-500 dark:text-neutral-400" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-zinc-200 dark:bg-[#141414]/95 dark:border-neutral-800 rounded-xl shadow-2xl shadow-black/60 p-1.5 z-50 flex flex-col gap-0.5 backdrop-blur-md">
          {languageOptions.map((opt) => {
            const isActive = opt.langKey === lang;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => applyLanguage(opt)}
                className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-left text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FFB800]/10 text-[#FFB800] font-bold border border-[#FFB800]/20'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800/50'
                }`}
              >
                <img src={opt.icon} alt={opt.label} className="w-4 h-3 object-cover rounded-xs" />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

