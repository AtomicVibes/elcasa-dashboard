'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { translations, TranslationLanguage } from '@/constants/translations';


type Language = TranslationLanguage;


interface LanguageContextType {
  language: Language;
  setLanguage: (next: Language) => void;
  toggleLanguage: () => void;
  t: (keyPath: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}

const STORAGE_KEY = 'elcasa-lang';

function normalizeLanguage(value: string | null | undefined): Language {
  if (value === 'en' || value === 'it' || value === 'fr') return value;
  return 'en';
}

export function LanguageProvider({
  children,
  initialLanguage,
}: {
  children: React.ReactNode;
  initialLanguage: Language;
}) {
  // IMPORTANT:
  // - deterministic first paint: no localStorage reads during initial render
  // - avoids SSR("Projects") vs client("Progetti") hydration mismatches
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  useEffect(() => {
    // Persist for next visits (not used for the initial render)
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // ignore write errors
    }
  }, [language]);

  const setLanguage = useMemo(() => {
    return (next: Language) => {
      setLanguageState(next);
      try {
        // Keep cookie + localStorage in sync for future SSR language initialization.
        // We set the cookie from the client to ensure subsequent navigations match the server.
        document.cookie = `${STORAGE_KEY}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }
    };
  }, []);

  const toggleLanguage = useMemo(() => {
    return () => {
      setLanguageState((prev) => {
        const next: Language = prev === 'en' ? 'it' : 'en';
        try {
          document.cookie = `${STORAGE_KEY}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
          window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // ignore
        }
        return next;
      });
    };
  }, []);

  const t = (keyPath: string): string => {
    if (!keyPath) return '';

    // 1. Direct safety check: see if the exact key string exists as a flat key in the active language
    if (translations[language] && translations[language][keyPath] !== undefined) {
      return translations[language][keyPath];
    }

    // 2. Fallback check: see if the exact key string exists as a flat key in English fallback
    if (translations['en'] && translations['en'][keyPath] !== undefined) {
      return translations['en'][keyPath];
    }

    // 3. Fallback processing for split dot structures (e.g. 'cases.tableHead.manager')
    const keys = keyPath.split('.');
    let current: unknown = translations[language];
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        current = (current as any)[key];
      } else {
        current = null;
        break;
      }
    }
    if (typeof current === 'string') return current;

    // 4. Fallback nested loop matching for English
    let fallback: unknown = translations['en'];
    for (const key of keys) {
      if (fallback && typeof fallback === 'object' && key in fallback) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fallback = (fallback as any)[key];
      } else {
        fallback = null;
        break;
      }
    }
    if (typeof fallback === 'string') return fallback;

    // 5. Hard absolute safety string return
    return keyPath;
  };

  // Optional: if client cookie differs from initialLanguage (e.g. user updated it in another tab),
  // we do NOT change language during the first render to preserve hydration.
  // This effect only runs after hydration.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const normalized = normalizeLanguage(stored);

      // Avoid synchronously updating state if it would create a cascading render.
      // This only exists to keep context consistent if language was changed outside
      // the current tab.
      if (normalized !== language) {
        // Defer to next tick to satisfy lint rules.
        queueMicrotask(() => setLanguageState(normalized));
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const value: LanguageContextType = {
    language,
    setLanguage,
    toggleLanguage,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}


