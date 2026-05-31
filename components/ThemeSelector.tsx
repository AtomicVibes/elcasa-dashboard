'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import type { ThemePreference } from '@/context/ThemeContext';

const OPTIONS: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
];

export function ThemeSelector() {
  const { theme, setTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <div className="mt-5 flex gap-2">
        {OPTIONS.map(({ label }) => (
          <div
            key={label}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-bold capitalize bg-zinc-200 text-zinc-400 dark:bg-[#0e0e0e] dark:text-zinc-700 animate-pulse"
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-5 flex gap-2">
      {OPTIONS.map(({ value, label, Icon }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-bold transition-colors capitalize',
              isActive
                ? 'bg-[#ffc107] text-black'
                : 'bg-zinc-200 text-zinc-600 hover:text-zinc-900 dark:bg-[#0e0e0e] dark:text-[#8e8e8e] dark:hover:text-white'
            )}
          >
            <Icon size={20} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
