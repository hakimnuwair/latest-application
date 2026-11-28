import { Link, useNavigate } from 'react-router-dom';
import { errorMessage } from '../../api/errors';
import type { SaleListItem } from '../../api/sales';
import { Button } from '../../components/Button';
import { PlusIcon } from '../../components/icons';
import { RetryButton, StateMessage } from '../../components/StateMessage';
import { Badge } from '../../components/ui/Badge';
import { DataList, type Column } from '../../components/ui/DataList';
import { PageHeader } from '../../components/ui/PageHeader';
import { Pagination } from '../../components/ui/Pagination';
import { ListSkeleton } from '../../components/ui/Skeleton';
import { Toggle } from '../../components/ui/Toggle';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useListParams } from '../../hooks/useListParams';
import { formatDateTime } from '../../utils/dates';
import { formatINR } from '../../utils/money';
import { SALES_PAGE_SIZE, useSales } from './queries';
import { MODE_LABEL } from './schema';

const KEYS = ['unpaid'] as const;

const owed = (s: SaleListItem) =>
  s.outstanding > 0 ? (
    <span className="font-semibold text-red-700 tabular-nums">{formatINR(s.outstanding)}</span>
  ) : (
    <Badge tone="good">Paid</Badge>
  );

/** Sales, newest first. Date range and customer filters are parked in 12c-4. */
export function SalesPage() {
  useDocumentTitle('Sales');
  const navigate = useNavigate();
  const { page, values, set, clear } = useListParams(KEYS);
  const unpaid = values.unpaid === 'true';
  const list = useSales({ page, limit: SALES_PAGE_SIZE, ...(unpaid ? { unpaid: true } : {}) });

  const columns: Column<SaleListItem>[] = [
    {
      header: 'Date',
      cell: (s) => (
        <Link to={`/admin/sales/${s.id}`} className="font-semibold hover:text-oud hover:underline">
          {formatDateTime(s.soldAt)}
        </Link>
      ),
    },
    {
      header: 'Customer',
      cell: (s) => s.customer?.name ?? <span className="text-muted">Walk-in</span>,
    },
    { header: 'Items', align: 'right', cell: (s) => s.itemCount },
    { header: 'Paid by', cell: (s) => MODE_LABEL[s.mode] },
    { header: 'Total', align: 'right', cell: (s) => formatINR(s.totalAmount) },
    { header: 'Still owed', align: 'right', cell: owed },
  ];

  return (
    <section>
      <PageHeader
        title="Sales"
        description="Everything you have sold, newest first."
        action={
          <Link to="/admin/sales/new">
            <Button>
              <PlusIcon className="mr-1.5" />
              New sale
            </Button>
          </Link>
        }
      />

      <div className="mb-4 max-w-sm">
        <Toggle
          label="Unpaid only"
          hint="Sales that are not fully paid"
          checked={unpaid}
          onChange={(e) => set({ unpaid: e.target.checked ? 'true' : '' }, true)}
        />
      </div>

      <p className="mb-3 min-h-5 text-sm text-muted" aria-live="polite">
        {list.data
          ? `${list.data.meta.total} ${list.data.meta.total === 1 ? 'sale' : 'sales'}`
          : ''}
      </p>

      {list.isPending ? (
        <ListSkeleton />
      ) : list.isError ? (
        <StateMessage
          title="Couldn't load the sales"
          message={errorMessage(list.error)}
          action={<RetryButton onClick={() => void list.refetch()} />}
        />
      ) : list.data.items.length === 0 ? (
        page > 1 ? (
          <StateMessage
            title="That page is empty"
            action={<Button onClick={() => set({ page: '' })}>Back to page 1</Button>}
          />
        ) : unpaid ? (
          <StateMessage
            title="Nothing unpaid"
            message="Every sale is paid in full."
            action={<Button onClick={clear}>Show all sales</Button>}
          />
        ) : (
          <StateMessage
            title="No sales yet"
            message="Your first sale takes a few taps."
            action={<Button onClick={() => navigate('/admin/sales/new')}>New sale</Button>}
          />
        )
      ) : (
        <div className={list.isPlaceholderData ? 'opacity-60 transition-opacity' : ''}>
          <DataList
            label="Sales"
            items={list.data.items}
            getKey={(s) => s.id}
            columns={columns}
            renderCard={(s) => (
              <Link to={`/admin/sales/${s.id}`} className="-m-1 block space-y-1 rounded-lg p-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold">{s.customer?.name ?? 'Walk-in'}</p>
                  <p className="font-semibold tabular-nums">{formatINR(s.totalAmount)}</p>
                </div>
                <p className="text-sm text-muted">
                  {formatDateTime(s.soldAt)} · {s.itemCount} {s.itemCount === 1 ? 'item' : 'items'}{' '}
                  · {MODE_LABEL[s.mode]}
                </p>
                <p className="text-sm">{s.outstanding > 0 ? <>Still owed {owed(s)}</> : owed(s)}</p>
              </Link>
            )}
          />
          <Pagination
            page={list.data.meta.page}
            totalPages={list.data.meta.totalPages}
            onChange={(p) => set({ page: p > 1 ? String(p) : '' })}
          />
        </div>
      )}
    </section>
  );
}
