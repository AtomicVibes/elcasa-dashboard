'use client';

import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { enGB, it as itLocale } from 'date-fns/locale';
import { cn } from '@/app/lib/utils';

type SupportedLang = 'en' | 'it';

type CustomDatePickerProps = {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  /** Controls localization for labels/month formatting inside the picker */
  lang?: SupportedLang;
};

const dictionaries: Record<SupportedLang, { placeholder: string }> = {
  en: { placeholder: 'Select date' },
  it: { placeholder: 'Seleziona data' },
};

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function CustomDatePicker({ value, onChange, placeholder, className, lang = 'en' }: CustomDatePickerProps) {
  // NOTE: value is treated as a full Date (date + time). The calendar controls only the day.
  // The time inputs control hours/minutes on the selected Date.
  const themeSelectedBg = '#FFC107';
  const themeSelectedText = '#0A0A0A';

  const [open, setOpen] = React.useState(false);

  const dateLocale = lang === 'en' ? enGB : itLocale;
  const t = dictionaries[lang];

  const today = React.useMemo(() => startOfDay(new Date()), []);
  const selected = value ? startOfDay(value) : null;

  const selectedHour = value ? value.getHours() : 12;
  const selectedMinute = value ? value.getMinutes() : 0;

  const pad2 = (n: number) => String(n).padStart(2, '0');
  const hourLabel = pad2(selectedHour);
  const minuteLabel = pad2(selectedMinute);

  const hourString = `${hourLabel}:${minuteLabel}`;

  const currentMonth = selected ?? today;
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDay = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();

  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const days: Date[] = [];

  // NOTE: currently date selection drives the selected day.
  // Time selection is part of the unified interface contract, but this component UI
  // does not yet expose time controls visually in the popover.


  for (let i = startingDay - 1; i >= 0; i--) {
    days.push(new Date(year, month - 1, prevMonthLastDay - i));
  }
  for (let i = 1; i <= totalDays; i++) {
    days.push(new Date(year, month, i));
  }

  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i));
  }

  const monthLabel = format(currentMonth, 'LLLL yyyy', { locale: dateLocale });
  const weekdays = format(new Date(2025, 0, 5), 'EEE', { locale: dateLocale });
  // Build weekday labels from locale by formatting a known week
  const weekdayLabels = React.useMemo(() => {
    const base = new Date(2025, 0, 5); // arbitrary Sunday-ish anchor
    return Array.from({ length: 7 }, (_, i) => format(new Date(base.getFullYear(), base.getMonth(), base.getDate() + i), 'EEEEE', { locale: dateLocale }).slice(0, 2));
  }, [dateLocale]);

  const withTime = (date: Date, hour: number, minute: number) => {
    const x = new Date(date);
    x.setHours(hour, minute, 0, 0);
    return x;
  };

  const onSelect = (d: Date) => {
    const hour = value ? value.getHours() : 12;
    const minute = value ? value.getMinutes() : 0;
    onChange(withTime(d, hour, minute));
  };

  // Placeholders for future time controls; kept for API consistency.



  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('justify-start text-left font-normal', !value && 'text-muted-foreground', className)}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-amber-400" />
          {value ? format(value, 'PP HH:mm', { locale: dateLocale }) : placeholder ?? t.placeholder}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" sideOffset={8} className="w-auto p-0 bg-[#121212] border border-zinc-800">
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-semibold text-white">{monthLabel}</div>
              <div className="text-[11px] text-neutral-500 mt-0.5">{hourString}</div>
            </div>
            {selected && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange(null)}
                className="h-6 px-2 text-xs text-amber-400 hover:text-amber-300"
              >
                Clear
              </Button>
            )}
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
{weekdayLabels.map((label, idx) => (
              <div key={`${label}-${idx}`} className="text-center text-xs font-medium text-neutral-400 py-1">
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((d, idx) => {
              const inMonth = d.getMonth() === month;
              const isSelected = selected ? isSameDay(d, selected) : false;
              const isToday = isSameDay(d, today);
              const weekend = d.getDay() === 0 || d.getDay() === 6;

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!inMonth}
                  onClick={() => inMonth && onSelect(d)}
                  className={cn(
                    'h-8 w-8 rounded-md text-sm font-medium transition-all',
                    isSelected && 'bg-[#FFC107] text-[#0A0A0A] font-bold',
                    !isSelected && inMonth && isToday && 'bg-neutral-800 text-white',
                    !isSelected && inMonth && !isToday && !weekend && 'text-neutral-300 hover:bg-neutral-800',
                    !isSelected && inMonth && !isToday && weekend && 'text-neutral-500 hover:bg-neutral-800',
                    !inMonth && 'text-neutral-600',
                    !inMonth && 'cursor-not-allowed'
                  )}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          {/* Time controls (unified date-time picker UI) */}
          <div className="mt-3 grid grid-cols-2 gap-2 px-3 pb-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Hour</label>
            <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Minute</label>

            <input
              type="number"
              min={0}
              max={23}
              value={selectedHour}
              onChange={(e) => {
                const next = Math.max(0, Math.min(23, Number(e.target.value || 0)));
                // update based on selected day (or today)
                const base = selected ?? today;
                const minute = value ? value.getMinutes() : selectedMinute;
                const x = new Date(base);
                x.setHours(next, minute, 0, 0);
                onChange(x);
              }}
              className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#FFC107]"
            />

            <input
              type="number"
              min={0}
              max={59}
              value={selectedMinute}
              onChange={(e) => {
                const next = Math.max(0, Math.min(59, Number(e.target.value || 0)));
                const base = selected ?? today;
                const hour = value ? value.getHours() : selectedHour;
                const x = new Date(base);
                x.setHours(hour, next, 0, 0);
                onChange(x);
              }}
              className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#FFC107]"
            />
          </div>

        </div>
      </PopoverContent>
    </Popover>
  );
}

