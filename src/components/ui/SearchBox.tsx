import { SearchIcon } from '../icons';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  /** Read by screen readers (the field has no visible label). */
  label?: string;
  placeholder?: string;
  id?: string;
}

/** Rounded search field used on the public catalog and in every admin list. */
export function SearchBox({
  value,
  onChange,
  onSubmit,
  label = 'Search products',
  placeholder = 'Search products',
  id = 'catalog-search',
}: Props) {
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="relative"
    >
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
      <input
        id={id}
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        maxLength={100}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block min-h-12 w-full rounded-full border border-line bg-white pr-4 pl-11 text-base placeholder:text-muted focus:border-oud"
      />
    </form>
  );
}
