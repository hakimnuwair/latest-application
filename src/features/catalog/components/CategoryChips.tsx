import type { PublicCategory } from '../../../api/public';

interface Props {
  categories: PublicCategory[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const chip =
  'inline-flex min-h-11 shrink-0 snap-start items-center rounded-full border px-4 text-sm font-semibold transition';

/** One scrolling row on a phone (swipe it), wraps naturally on wide screens. */
export function CategoryChips({ categories, selectedId, onSelect }: Props) {
  const item = (id: string, label: string) => {
    const on = id === selectedId;
    return (
      <button
        key={id || 'all'}
        type="button"
        aria-pressed={on}
        onClick={() => onSelect(id)}
        className={`${chip} ${
          on
            ? 'border-oud bg-oud text-white'
            : 'border-line bg-white text-ink hover:border-oud/50 hover:bg-oud-soft'
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div
      role="group"
      aria-label="Filter by category"
      className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:px-0"
    >
      {item('', 'All')}
      {categories.map((c) => item(c.id, c.name))}
    </div>
  );
}
