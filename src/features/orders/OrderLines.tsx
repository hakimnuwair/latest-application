import { useQuery } from '@tanstack/react-query';
import { useEffect, useId, useRef, useState } from 'react';
import { errorMessage } from '../../api/errors';
import { fetchProducts, type AdminProduct } from '../../api/products';
import { keys } from '../../api/queryKeys';
import { MinusIcon, PlusIcon, SearchIcon, XIcon } from '../../components/icons';
import { Badge } from '../../components/ui/Badge';
import { MoneyInput } from '../../components/ui/MoneyInput';
import { formatINR } from '../../utils/money';
import { lineTotal, MAX_QTY, newLine, parseQty, type OrderLine } from './lines';

interface Props {
  lines: OrderLine[];
  onChange: (lines: OrderLine[]) => void;
  /** Label of the price field: "Price per piece" for a sale, "Unit cost" for a purchase. */
  priceLabel: string;
  /** The price a new row starts with, in paise: the selling price for a sale, the average cost for a purchase. */
  startPrice: (product: AdminProduct) => number;
  /** A sale cannot take a product with no stock; a purchase can. */
  needsStock: boolean;
  disabled?: boolean;
}

const MAX_LINES = 100;
const SEARCH_LIMIT = 8;

/** Debounced copy of a value, so the product search waits for a pause in typing. */
const useDebounced = (value: string, ms = 250): string => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(timer);
  }, [value, ms]);
  return debounced;
};

const stepButton =
  'grid size-11 shrink-0 place-items-center rounded-lg border border-line bg-white text-ink transition hover:bg-oud-soft disabled:opacity-40';

/**
 * The product rows of a sale or a purchase: search active products as you type, tap one to add it, change the
 * quantity and the price, remove a row. Shared by 12c-2b (sales) and 12c-2c (purchases). It only edits the rows;
 * totals and saving belong to the page.
 */
export function OrderLines({
  lines,
  onChange,
  priceLabel,
  startPrice,
  needsStock,
  disabled,
}: Props) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  const search = useDebounced(text.trim());
  const atLimit = lines.length >= MAX_LINES;

  const results = useQuery({
    queryKey: [...keys.products, 'picker', search],
    queryFn: ({ signal }) =>
      fetchProducts({ page: 1, limit: SEARCH_LIMIT, search, isActive: 'true' }, signal),
    enabled: search !== '',
  });

  const add = (product: AdminProduct) => {
    const existing = lines.findIndex((l) => l.productId === product.id);
    if (existing >= 0) {
      // Each product once: tapping it again adds one more piece to its row.
      const current = parseQty(lines[existing]?.qty ?? '') ?? 0;
      update(existing, { qty: String(Math.min(MAX_QTY, current + 1)) });
    } else {
      onChange([...lines, newLine(product, startPrice(product))]);
    }
    setText('');
    inputRef.current?.focus();
  };

  const update = (index: number, change: Partial<OrderLine>) =>
    onChange(lines.map((line, i) => (i === index ? { ...line, ...change } : line)));

  const step = (index: number, delta: number) => {
    const current = parseQty(lines[index]?.qty ?? '') ?? 0;
    update(index, { qty: String(Math.min(MAX_QTY, Math.max(1, current + delta))) });
  };

  const typed = text.trim() !== '';

  return (
    <div>
      <div className="relative">
        <label htmlFor={`${listId}-search`} className="mb-1.5 block text-sm font-medium">
          Add a product
        </label>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
          <input
            ref={inputRef}
            id={`${listId}-search`}
            type="search"
            value={text}
            disabled={disabled || atLimit}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              // Enter adds the first result (when the list is showing) and never submits the page's form.
              if (e.key !== 'Enter') return;
              e.preventDefault();
              const first = search === text.trim() ? results.data?.items[0] : undefined;
              if (first && !(needsStock && first.stockQty <= 0)) add(first);
            }}
            placeholder={atLimit ? 'Most lines in one go: 100' : 'Search by name or SKU'}
            autoComplete="off"
            aria-controls={`${listId}-results`}
            className="min-h-12 w-full rounded-xl border border-line bg-white pr-3 pl-10 text-base outline-none focus:border-oud focus:ring-2 focus:ring-oud/25 disabled:bg-plinth"
          />
        </div>

        {typed ? (
          <div
            id={`${listId}-results`}
            className="mt-2 overflow-hidden rounded-xl border border-line bg-white shadow-sm"
            aria-live="polite"
          >
            {results.isPending || search !== text.trim() ? (
              <p className="px-4 py-3 text-sm text-muted">Searching…</p>
            ) : results.isError ? (
              <p className="px-4 py-3 text-sm text-red-700">{errorMessage(results.error)}</p>
            ) : results.data.items.length === 0 ? (
              <p className="px-4 py-3 text-sm text-muted">No active product matches "{search}".</p>
            ) : (
              <ul>
                {results.data.items.map((p) => {
                  const blocked = needsStock && p.stockQty <= 0;
                  return (
                    <li key={p.id} className="border-b border-line last:border-b-0">
                      <button
                        type="button"
                        disabled={blocked}
                        onClick={() => add(p)}
                        aria-label={`Add ${p.name}`}
                        className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-2 text-left transition hover:bg-oud-soft disabled:opacity-50 disabled:hover:bg-white"
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{p.name}</span>
                          <span className="block truncate text-sm text-muted">
                            {p.sku ? `${p.sku} · ` : ''}
                            {p.category.name}
                          </span>
                        </span>
                        <span className="shrink-0 text-right text-sm">
                          <span className="block font-semibold tabular-nums">
                            {formatINR(p.sellingPrice)}
                          </span>
                          {blocked ? (
                            <Badge tone="bad">Out of stock</Badge>
                          ) : (
                            <span className="text-muted">{p.stockQty} in stock</span>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : null}
      </div>

      {lines.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
          Search above and tap a product to add it.
        </p>
      ) : (
        <ul className="mt-4 space-y-3" aria-label="Products in this order">
          {lines.map((line, index) => {
            const qty = parseQty(line.qty);
            const tooMany = needsStock && qty !== null && qty > line.stockQty;
            return (
              <li key={line.productId} className="rounded-2xl border border-line bg-white p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="leading-snug font-semibold break-words">{line.name}</p>
                    {line.sku ? <p className="text-sm text-muted">{line.sku}</p> : null}
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${line.name}`}
                    disabled={disabled}
                    onClick={() => onChange(lines.filter((_, i) => i !== index))}
                    className="-mt-1 -mr-1 grid size-11 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-oud-soft hover:text-ink"
                  >
                    <XIcon />
                  </button>
                </div>

                <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <p className="mb-1.5 text-sm font-medium">Quantity</p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`One less ${line.name}`}
                        disabled={disabled || (qty ?? 0) <= 1}
                        onClick={() => step(index, -1)}
                        className={stepButton}
                      >
                        <MinusIcon />
                      </button>
                      <input
                        aria-label={`Quantity of ${line.name}`}
                        inputMode="numeric"
                        autoComplete="off"
                        disabled={disabled}
                        value={line.qty}
                        onChange={(e) => update(index, { qty: e.target.value.replace(/\D/g, '') })}
                        aria-invalid={qty === null ? true : undefined}
                        className="min-h-11 w-20 rounded-lg border border-line bg-white text-center text-base tabular-nums outline-none focus:border-oud focus:ring-2 focus:ring-oud/25 aria-[invalid=true]:border-red-600"
                      />
                      <button
                        type="button"
                        aria-label={`One more ${line.name}`}
                        disabled={disabled || (qty ?? 0) >= MAX_QTY}
                        onClick={() => step(index, 1)}
                        className={stepButton}
                      >
                        <PlusIcon />
                      </button>
                    </div>
                    {needsStock ? (
                      <p
                        className={`mt-1.5 text-sm ${tooMany ? 'font-medium text-amber-800' : 'text-muted'}`}
                      >
                        {tooMany ? `Only ${line.stockQty} in stock` : `${line.stockQty} in stock`}
                      </p>
                    ) : null}
                  </div>
                  <MoneyInput
                    label={priceLabel}
                    value={line.price}
                    disabled={disabled}
                    onChange={(e) => update(index, { price: e.target.value })}
                  />
                </div>

                <p className="mt-2 flex items-center justify-between border-t border-line pt-2 text-sm">
                  <span className="text-muted">Line total</span>
                  <span className="font-semibold tabular-nums">{formatINR(lineTotal(line))}</span>
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
