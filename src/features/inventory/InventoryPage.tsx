import { useState } from 'react';
import { Link } from 'react-router-dom';
import { errorMessage } from '../../api/errors';
import type { InventoryItem, MoveReason, StockMovement } from '../../api/inventory';
import { Button } from '../../components/Button';
import { XIcon } from '../../components/icons';
import { RetryButton, StateMessage } from '../../components/StateMessage';
import { Badge } from '../../components/ui/Badge';
import { DataList, type Column } from '../../components/ui/DataList';
import { DateField } from '../../components/ui/DateField';
import { PageHeader } from '../../components/ui/PageHeader';
import { Pagination } from '../../components/ui/Pagination';
import { SearchBox } from '../../components/ui/SearchBox';
import { Segmented } from '../../components/ui/Segmented';
import { Select } from '../../components/ui/Select';
import { ListSkeleton } from '../../components/ui/Skeleton';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useListParams, useSearchInput } from '../../hooks/useListParams';
import { dayEndIso, dayStartIso, formatDateTime } from '../../utils/dates';
import { formatINR } from '../../utils/money';
import { useCategories } from '../categories/queries';
import { AdjustStockModal } from './AdjustStockModal';
import { useInventory, useMovements } from './queries';

const PAGE_SIZE = 20;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const YMD = /^\d{4}-\d{2}-\d{2}$/;

type View = 'stock' | 'history';
const VIEWS = [
  { value: 'stock', label: 'Stock' },
  { value: 'history', label: 'History' },
] as const;

const REASON_LABEL: Record<MoveReason, string> = {
  PURCHASE: 'Purchase',
  SALE: 'Sale',
  ADJUSTMENT: 'Adjustment',
  RETURN: 'Return',
};
const KEYS = [
  'view',
  'search',
  'categoryId',
  'lowStock',
  'productId',
  'pname',
  'reason',
  'from',
  'to',
] as const;

export function InventoryPage() {
  useDocumentTitle('Inventory');
  const params = useListParams(KEYS);
  const view: View = params.values.view === 'history' ? 'history' : 'stock';

  return (
    <section>
      <PageHeader
        title="Inventory"
        description="What you have in stock and how it changed. Purchases add stock, sales remove it."
      />
      <div className="mb-4">
        <Segmented
          ariaLabel="Inventory view"
          value={view}
          options={VIEWS}
          // Switching view starts clean so filters of one tab never leak into the other.
          onChange={(next) => {
            params.clear();
            if (next === 'history') params.set({ view: 'history' }, true);
          }}
        />
      </div>
      {view === 'stock' ? <StockTab params={params} /> : <HistoryTab params={params} />}
    </section>
  );
}

type Params = ReturnType<typeof useListParams<(typeof KEYS)[number]>>;

// ---------------------------------------------------------------------------------------------
// Stock
// ---------------------------------------------------------------------------------------------

function StatusBadge({ item }: { item: InventoryItem }) {
  if (item.status === 'OUT_OF_STOCK') return <Badge tone="bad">Out of stock</Badge>;
  if (item.status === 'LOW') return <Badge tone="warn">Low</Badge>;
  return null;
}

function StockTab({ params }: { params: Params }) {
  const { page, values, set, clear } = params;
  const search = useSearchInput(values.search, (value) => set({ search: value }, true));
  const categoryId = UUID.test(values.categoryId) ? values.categoryId : '';
  const lowStock = values.lowStock === 'true' ? 'true' : '';
  const categories = useCategories();
  const [adjusting, setAdjusting] = useState<InventoryItem | null>(null);

  const list = useInventory({
    page,
    limit: PAGE_SIZE,
    ...(values.search ? { search: values.search } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(lowStock ? { lowStock } : {}),
  });
  const filtered = values.search !== '' || categoryId !== '' || lowStock !== '';

  const historyLink = (item: InventoryItem) =>
    `/admin/inventory?view=history&productId=${item.id}&pname=${encodeURIComponent(item.name)}`;

  const actions = (item: InventoryItem) => (
    <div className="flex gap-2">
      <Button
        variant="secondary"
        onClick={() => setAdjusting(item)}
        aria-label={`Adjust stock of ${item.name}`}
      >
        Adjust
      </Button>
      <Link
        to={historyLink(item)}
        aria-label={`Stock history of ${item.name}`}
        className="inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-base font-medium text-oud transition hover:bg-oud-soft"
      >
        History
      </Link>
    </div>
  );

  const columns: Column<InventoryItem>[] = [
    {
      header: 'Product',
      cell: (i) => (
        <div className="min-w-0">
          <p className="font-semibold">{i.name}</p>
          <p className="text-muted">
            {i.category.name}
            {i.sku ? ` · ${i.sku}` : ''}
          </p>
        </div>
      ),
    },
    {
      header: 'In stock',
      align: 'right',
      cell: (i) => (
        <div className="flex items-center justify-end gap-2">
          <StatusBadge item={i} />
          <span className="font-semibold">{i.stockQty}</span>
        </div>
      ),
    },
    { header: 'Average cost', align: 'right', cell: (i) => formatINR(i.avgCost) },
    { header: 'Stock value', align: 'right', cell: (i) => formatINR(i.stockValue) },
    {
      header: 'Actions',
      align: 'right',
      cell: (i) => <div className="flex justify-end">{actions(i)}</div>,
    },
  ];

  return (
    <>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_14rem_14rem]">
        <div className="sm:col-span-2 lg:col-span-1">
          <SearchBox
            id="inventory-search"
            label="Search stock by name or SKU"
            placeholder="Search by name or SKU"
            value={search.text}
            onChange={search.onChange}
            onSubmit={search.submit}
          />
        </div>
        <Select
          label="Category"
          hideLabel
          value={categoryId}
          onChange={(e) => set({ categoryId: e.target.value })}
        >
          <option value="">All categories</option>
          {categories.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          label="Stock level"
          hideLabel
          value={lowStock}
          onChange={(e) => set({ lowStock: e.target.value })}
        >
          <option value="">All stock</option>
          <option value="true">Low and out of stock</option>
        </Select>
      </div>

      <p className="mb-3 min-h-5 text-sm text-muted" aria-live="polite">
        {list.data
          ? `${list.data.meta.total} ${list.data.meta.total === 1 ? 'product' : 'products'}`
          : ''}
      </p>

      {list.isPending ? (
        <ListSkeleton />
      ) : list.isError ? (
        <StateMessage
          title="Couldn't load the stock"
          message={errorMessage(list.error)}
          action={<RetryButton onClick={() => void list.refetch()} />}
        />
      ) : list.data.items.length === 0 ? (
        page > 1 ? (
          <StateMessage
            title="That page is empty"
            action={<Button onClick={() => set({ page: '' })}>Back to page 1</Button>}
          />
        ) : filtered ? (
          <StateMessage
            title="Nothing matches"
            message={
              lowStock
                ? 'No product is low on stock with these filters.'
                : 'Try a different word or filter.'
            }
            action={
              <Button
                onClick={() => {
                  search.reset();
                  clear();
                }}
              >
                Clear search and filters
              </Button>
            }
          />
        ) : (
          <StateMessage
            title="No products yet"
            message="Add products first, then their stock shows up here."
            action={
              <Link
                to="/admin/products/new"
                className="inline-flex min-h-11 items-center rounded-lg bg-oud px-4 font-medium text-white"
              >
                Add product
              </Link>
            }
          />
        )
      ) : (
        <div className={list.isPlaceholderData ? 'opacity-60 transition-opacity' : ''}>
          <DataList
            label="Stock"
            items={list.data.items}
            getKey={(i) => i.id}
            columns={columns}
            renderCard={(i) => (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{i.name}</p>
                    <p className="text-sm text-muted">
                      {i.category.name}
                      {i.sku ? ` · ${i.sku}` : ''}
                    </p>
                  </div>
                  <StatusBadge item={i} />
                </div>
                <dl className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <dt className="text-muted">In stock</dt>
                    <dd className="text-lg font-semibold tabular-nums">{i.stockQty}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Avg cost</dt>
                    <dd className="font-semibold tabular-nums">{formatINR(i.avgCost)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Value</dt>
                    <dd className="font-semibold tabular-nums">{formatINR(i.stockValue)}</dd>
                  </div>
                </dl>
                {actions(i)}
              </div>
            )}
          />
          <Pagination
            page={page}
            totalPages={list.data.meta.totalPages}
            onChange={(next) => set({ page: next > 1 ? String(next) : '' })}
          />
        </div>
      )}

      <AdjustStockModal item={adjusting} onClose={() => setAdjusting(null)} />
    </>
  );
}

// ---------------------------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------------------------

function ChangeCell({ qty }: { qty: number }) {
  return (
    <span className={`font-semibold tabular-nums ${qty > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
      {qty > 0 ? `+${qty}` : qty}
    </span>
  );
}

function HistoryTab({ params }: { params: Params }) {
  const { page, values, set } = params;
  const productId = UUID.test(values.productId) ? values.productId : '';
  const reason =
    (['PURCHASE', 'SALE', 'ADJUSTMENT', 'RETURN'] as const).find((r) => r === values.reason) ?? '';
  const from = YMD.test(values.from) ? values.from : '';
  const to = YMD.test(values.to) ? values.to : '';

  const list = useMovements({
    page,
    limit: PAGE_SIZE,
    ...(productId ? { productId } : {}),
    ...(reason ? { reason } : {}),
    ...(from ? { from: dayStartIso(from) } : {}),
    ...(to ? { to: dayEndIso(to) } : {}),
  });
  const filtered = productId !== '' || reason !== '' || from !== '' || to !== '';

  const columns: Column<StockMovement>[] = [
    { header: 'When', cell: (m) => formatDateTime(m.createdAt) },
    { header: 'Product', cell: (m) => <span className="font-medium">{m.product.name}</span> },
    { header: 'Change', align: 'right', cell: (m) => <ChangeCell qty={m.qtyChange} /> },
    { header: 'Reason', cell: (m) => <Badge tone="info">{REASON_LABEL[m.reason]}</Badge> },
    { header: 'Note', cell: (m) => <span className="text-muted">{m.note ?? ''}</span> },
  ];

  return (
    <>
      <div className="mb-4 space-y-3">
        {productId ? (
          <button
            type="button"
            onClick={() => set({ productId: '', pname: '' }, true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white pr-3 pl-4 text-sm font-semibold transition hover:bg-oud-soft"
          >
            {values.pname || 'One product'}
            <XIcon width={16} height={16} />
            <span className="sr-only">Show all products</span>
          </button>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-3">
          <Select
            label="Reason"
            hideLabel
            value={reason}
            onChange={(e) => set({ reason: e.target.value }, true)}
          >
            <option value="">All reasons</option>
            {Object.entries(REASON_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <DateField
            label="From"
            value={from}
            onChange={(e) => set({ from: e.target.value }, true)}
          />
          <DateField label="To" value={to} onChange={(e) => set({ to: e.target.value }, true)} />
        </div>
      </div>

      <p className="mb-3 min-h-5 text-sm text-muted" aria-live="polite">
        {list.data
          ? `${list.data.meta.total} ${list.data.meta.total === 1 ? 'change' : 'changes'}`
          : ''}
      </p>

      {list.isPending ? (
        <ListSkeleton />
      ) : list.isError ? (
        <StateMessage
          title="Couldn't load the history"
          message={errorMessage(list.error)}
          action={<RetryButton onClick={() => void list.refetch()} />}
        />
      ) : list.data.items.length === 0 ? (
        page > 1 ? (
          <StateMessage
            title="That page is empty"
            action={<Button onClick={() => set({ page: '' })}>Back to page 1</Button>}
          />
        ) : (
          <StateMessage
            title={filtered ? 'No changes found' : 'No stock changes yet'}
            message={
              filtered
                ? 'Try other dates or another reason.'
                : 'Every purchase, sale and adjustment is listed here.'
            }
          />
        )
      ) : (
        <div className={list.isPlaceholderData ? 'opacity-60 transition-opacity' : ''}>
          <DataList
            label="Stock history"
            items={list.data.items}
            getKey={(m) => m.id}
            columns={columns}
            renderCard={(m) => (
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold">{m.product.name}</p>
                  <ChangeCell qty={m.qtyChange} />
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
                  <Badge tone="info">{REASON_LABEL[m.reason]}</Badge>
                  <span>{formatDateTime(m.createdAt)}</span>
                </div>
                {m.note ? <p className="text-sm text-muted">{m.note}</p> : null}
              </div>
            )}
          />
          <Pagination
            page={page}
            totalPages={list.data.meta.totalPages}
            onChange={(next) => set({ page: next > 1 ? String(next) : '' })}
          />
        </div>
      )}
    </>
  );
}
