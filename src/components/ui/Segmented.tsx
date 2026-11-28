interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
}

/** A small either-or choice shown as joined buttons (for example Active | Deleted). */
export function Segmented<T extends string>({ value, options, onChange, ariaLabel }: Props<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex rounded-xl border border-line bg-white p-1"
    >
      {options.map((option) => {
        const on = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(option.value)}
            className={`min-h-11 rounded-lg px-4 text-sm font-semibold transition ${
              on ? 'bg-oud text-white' : 'text-ink hover:bg-oud-soft'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
