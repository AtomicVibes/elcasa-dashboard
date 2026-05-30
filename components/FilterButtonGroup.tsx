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
    <div className="flex items-center gap-2.5 flex-wrap" data-i18n={labelI18nKey}>
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">
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
              ? 'bg-accent/10 border-accent text-accent px-4 py-1.5 rounded-full border text-xs font-medium transition-all'
              : 'bg-muted dark:bg-card border-muted-foreground/20 dark:border-zinc-700 text-muted-foreground dark:hover:text-foreground px-4 py-1.5 rounded-full border text-xs transition-all'
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}
