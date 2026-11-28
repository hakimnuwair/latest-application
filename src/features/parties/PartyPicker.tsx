import { useQuery } from '@tanstack/react-query';
import { useEffect, useId, useState } from 'react';
import { errorMessage } from '../../api/errors';
import type { Party } from '../../api/parties';
import { keys } from '../../api/queryKeys';
import { Button } from '../../components/Button';
import { PlusIcon, SearchIcon, XIcon } from '../../components/icons';
import { formatINR } from '../../utils/money';
import { PartyFormModal } from './PartyFormModal';
import type { PartyConfig } from './types';

interface Props {
  config: PartyConfig;
  value: Party | null;
  onChange: (party: Party | null) => void;
  /** Shown above the field, for example "Customer (needed for credit)". */
  label: string;
  error?: string | undefined;
  disabled?: boolean;
}

/**
 * Pick a customer or supplier by searching, or add a new one without leaving the page. Shared by the sale
 * screen (customers) and the purchase screen (suppliers, 12c-2c).
 */
export function PartyPicker({ config, value, onChange, label, error, disabled }: Props) {
  const id = useId();
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(text.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [text]);

  const results = useQuery({
    queryKey: [...(config.kind === 'customer' ? keys.customers : keys.suppliers), 'picker', search],
    queryFn: ({ signal }) => config.api.list({ page: 1, limit: 6, search }, signal),
    enabled: !value && search !== '',
  });

  const pick = (party: Party) => {
    onChange(party);
    setText('');
    setSearch('');
  };

  return (
    <div>
      <p id={`${id}-label`} className="mb-1.5 text-sm font-medium">
        {label}
      </p>
      {value ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-2">
          <div className="min-w-0">
            <p className="truncate font-semibold">{value.name}</p>
            <p className="truncate text-sm text-muted">
              {value.outstanding > 0
                ? config.owedText(value.outstanding)
                : (value.phone ?? 'All settled')}
            </p>
          </div>
          <button
            type="button"
            aria-label={`Remove ${config.singular} ${value.name}`}
            disabled={disabled}
            onClick={() => onChange(null)}
            className="grid size-11 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-oud-soft hover:text-ink"
          >
            <XIcon />
          </button>
        </div>
      ) : (
        <div>
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={text}
                disabled={disabled}
                onChange={(e) => setText(e.target.value)}
                placeholder={`Search ${config.singular} by name or phone`}
                aria-labelledby={`${id}-label`}
                autoComplete="off"
                aria-invalid={error ? true : undefined}
                className="min-h-12 w-full rounded-xl border border-line bg-white pr-3 pl-10 text-base outline-none focus:border-oud focus:ring-2 focus:ring-oud/25 aria-[invalid=true]:border-red-600"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              disabled={disabled}
              onClick={() => setAdding(true)}
            >
              <PlusIcon className="mr-1.5" />
              New
            </Button>
          </div>
          {text.trim() !== '' ? (
            <div
              className="mt-2 overflow-hidden rounded-xl border border-line bg-white shadow-sm"
              aria-live="polite"
            >
              {results.isPending || search !== text.trim() ? (
                <p className="px-4 py-3 text-sm text-muted">Searching…</p>
              ) : results.isError ? (
                <p className="px-4 py-3 text-sm text-red-700">{errorMessage(results.error)}</p>
              ) : results.data.items.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted">
                  No {config.singular} found. Use "New" to add one.
                </p>
              ) : (
                <ul>
                  {results.data.items.map((p) => (
                    <li key={p.id} className="border-b border-line last:border-b-0">
                      <button
                        type="button"
                        onClick={() => pick(p)}
                        aria-label={`Choose ${p.name}`}
                        className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-2 text-left transition hover:bg-oud-soft"
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{p.name}</span>
                          <span className="block truncate text-sm text-muted">
                            {p.phone ?? 'No phone'}
                          </span>
                        </span>
                        {p.outstanding > 0 ? (
                          <span className="shrink-0 text-sm font-semibold text-red-700 tabular-nums">
                            {formatINR(p.outstanding)}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </div>
      )}
      {error ? (
        <p role="alert" className="mt-1.5 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <PartyFormModal
        config={config}
        party={null}
        open={adding}
        onClose={() => setAdding(false)}
        onSaved={pick}
      />
    </div>
  );
}
