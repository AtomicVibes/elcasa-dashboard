'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  isDark: boolean;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}

const THEME_STORAGE_KEY = 'global-app-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const syncTheme = () => {
      const savedTheme = (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null) || 'dark';
      setThemeState(savedTheme);

      // Apply theme to document immediately to prevent flash
      if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
    };

    syncTheme();
    setMounted(true);

    // Listen for storage changes across tabs/windows (e.g., user changes theme in another tab)
    window.addEventListener('storage', syncTheme);

    return () => {
      window.removeEventListener('storage', syncTheme);
    };
  }, []);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);

    // Update localStorage
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);

    // Update DOM immediately
    if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const value: ThemeContextType = {
    isDark: theme === 'dark',
    theme,
    setTheme,
    toggleTheme,
    mounted,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
