import { SearchIcon } from '../../../components/icons';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function SearchBox({ value, onChange, onSubmit }: Props) {
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="relative"
    >
      <label htmlFor="catalog-search" className="sr-only">
        Search products
      </label>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
      <input
        id="catalog-search"
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        maxLength={100}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search products"
        className="block min-h-12 w-full rounded-full border border-line bg-white pr-4 pl-11 text-base placeholder:text-muted focus:border-oud"
      />
    </form>
  );
}
