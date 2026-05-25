'use client';

export interface FilterOption {
  key: string;
  label: string;
  i18nKey?: string;
}

interface FilterButtonGroupProps {
  label: string;
  labelI18nKey?: string;
  options: FilterOption[];
  active: string;
  onChange: (key: string) => void;
}

export function FilterButtonGroup({
  label,
  labelI18nKey,
  options,
  active,
  onChange,
}: FilterButtonGroupProps) {
  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <span
        className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-[#8e8e8e] mr-1"
        data-i18n={labelI18nKey}
      >
        {label}
      </span>
      {options.map(({ key, label, i18nKey }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          data-i18n={i18nKey}
          className={
            active === key
              ? 'bg-[#FFB800]/10 border-[#FFB800] text-[#FFB800] px-4 py-1.5 rounded-full border text-xs font-medium transition-all'
              : 'bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-[#8e8e8e] dark:hover:text-white px-4 py-1.5 rounded-full border text-xs transition-all'
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}
