'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

export const THEME_STORAGE_KEY = 'global-app-theme';

type ThemeMode = 'light' | 'dark';
export type ThemePreference = ThemeMode | 'system';

interface ThemeContextType {
  theme: ThemePreference;
  resolvedTheme: ThemeMode;
  setTheme: (theme: ThemePreference) => void;
  isDark: boolean;
  mounted: boolean;
}

interface ThemeState {
  preference: ThemePreference;
  resolved: ThemeMode;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}

function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getStoredPreference(): ThemePreference | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {}
  return null;
}

function resolveTheme(preference: ThemePreference): ThemeMode {
  return preference === 'system' ? getSystemTheme() : preference;
}

function applyThemeClass(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === 'light') {
    root.classList.remove('dark');
  } else {
    root.classList.add('dark');
  }
  root.style.colorScheme = mode;
}

function createInitialState(): ThemeState {
  if (typeof window === 'undefined') {
    return { preference: 'system', resolved: 'dark', mounted: false };
  }
  const preference = getStoredPreference() ?? 'system';
  const resolved = resolveTheme(preference);
  applyThemeClass(resolved);
  return { preference, resolved, mounted: true };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ThemeState>(createInitialState);

  const syncFromStorage = useCallback(() => {
    const preference = getStoredPreference() ?? 'system';
    const resolved = resolveTheme(preference);
    applyThemeClass(resolved);
    setState({ preference, resolved, mounted: true });
  }, []);

  const onSystemChange = useCallback(() => {
    setState((prev) => {
      if (prev.preference !== 'system') return prev;
      const resolved = getSystemTheme();
      applyThemeClass(resolved);
      return { ...prev, resolved };
    });
  }, []);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    mql.addEventListener('change', onSystemChange);
    return () => mql.removeEventListener('change', onSystemChange);
  }, [onSystemChange]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== THEME_STORAGE_KEY) return;
      syncFromStorage();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [syncFromStorage]);

  const setTheme = useCallback((next: ThemePreference) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {}
    const resolved = resolveTheme(next);
    applyThemeClass(resolved);
    setState({ preference: next, resolved, mounted: true });
  }, []);

  const value = useMemo<ThemeContextType>(
    () => ({
      theme: state.preference,
      resolvedTheme: state.resolved,
      setTheme,
      isDark: state.resolved === 'dark',
      mounted: state.mounted,
    }),
    [state.preference, state.resolved, state.mounted, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
