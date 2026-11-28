import { Link, useParams } from 'react-router-dom';
import { errorMessage, isNotFound } from '../../api/errors';
import type { SaleLine } from '../../api/sales';
import { Button } from '../../components/Button';
import { PlusIcon } from '../../components/icons';
import { RetryButton, StateMessage } from '../../components/StateMessage';
import { Badge } from '../../components/ui/Badge';
import { DataList, type Column } from '../../components/ui/DataList';
import { PageHeader } from '../../components/ui/PageHeader';
import { Skeleton } from '../../components/ui/Skeleton';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatDateTime } from '../../utils/dates';
import { formatINR } from '../../utils/money';
import { useSale } from './queries';
import { MODE_LABEL } from './schema';

const back = (
  <Link to="/admin/sales" className="text-sm text-muted hover:text-ink">
    All sales
  </Link>
);

/** One saved sale, exactly as the server stored it. Nothing is calculated here. */
export function SaleDetailPage() {
  useDocumentTitle('Sale');
  const { id = '' } = useParams();
  const sale = useSale(id);

  if (sale.isPending) {
    return (
      <section>
        <PageHeader title="Sale" back={back} />
        <Skeleton className="h-40 w-full" />
      </section>
    );
  }
  if (sale.isError) {
    return (
      <section>
        <PageHeader title="Sale" back={back} />
        {isNotFound(sale.error) ? (
          <StateMessage
            title="Sale not found"
            message="It may have been removed, or the link is wrong."
            action={
              <Link to="/admin/sales">
                <Button>Back to sales</Button>
              </Link>
            }
          />
        ) : (
          <StateMessage
            title="Couldn't load this sale"
            message={errorMessage(sale.error)}
            action={<RetryButton onClick={() => void sale.refetch()} />}
          />
        )}
      </section>
    );
  }

  const s = sale.data;
  const columns: Column<SaleLine>[] = [
    { header: 'Product', cell: (l) => <span className="font-medium">{l.productName}</span> },
    { header: 'Qty', align: 'right', cell: (l) => l.qty },
    { header: 'Price', align: 'right', cell: (l) => formatINR(l.unitPrice) },
    {
      header: 'Cost each',
      align: 'right',
      cell: (l) => <span className="text-muted">{formatINR(l.unitCost)}</span>,
    },
    {
      header: 'Total',
      align: 'right',
      cell: (l) => <span className="font-semibold">{formatINR(l.lineTotal)}</span>,
    },
  ];

  return (
    <section>
      <PageHeader
        title="Sale"
        description={formatDateTime(s.soldAt)}
        back={back}
        action={
          <Link to="/admin/sales/new">
            <Button>
              <PlusIcon className="mr-1.5" />
              New sale
            </Button>
          </Link>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total" value={formatINR(s.totalAmount)} strong />
        <Stat label="Paid" value={formatINR(s.amountPaid)} />
        <Stat
          label="Still owed"
          value={formatINR(s.outstanding)}
          tone={s.outstanding > 0 ? 'bad' : undefined}
        />
        <div className="rounded-2xl border border-line bg-white p-3.5">
          <p className="text-sm text-muted">Paid by</p>
          <p className="mt-1">
            <Badge tone={s.mode === 'CREDIT' ? 'warn' : 'info'}>{MODE_LABEL[s.mode]}</Badge>
          </p>
        </div>
      </div>

      <p className="mb-4 text-base">
        <span className="text-muted">Customer: </span>
        {s.customer ? (
          <Link
            to={`/admin/customers/${s.customer.id}`}
            className="font-semibold text-oud hover:underline"
          >
            {s.customer.name}
          </Link>
        ) : (
          <span className="font-medium">Walk-in (no customer)</span>
        )}
      </p>

      <DataList
        label="Items sold"
        items={s.items}
        getKey={(l) => l.id}
        columns={columns}
        renderCard={(l) => (
          <div className="space-y-1">
            <p className="font-semibold break-words">{l.productName}</p>
            <p className="text-sm text-muted tabular-nums">
              {l.qty} × {formatINR(l.unitPrice)} · cost {formatINR(l.unitCost)} each
            </p>
            <p className="text-right font-semibold tabular-nums">{formatINR(l.lineTotal)}</p>
          </div>
        )}
      />

      <div className="sticky bottom-20 z-10 mt-6 md:hidden">
        <Link to="/admin/sales/new" className="block">
          <Button className="w-full shadow-lg">New sale</Button>
        </Link>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  strong,
  tone,
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: 'bad';
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-3.5">
      <p className="text-sm text-muted">{label}</p>
      <p
        className={`mt-1 tabular-nums ${strong ? 'text-xl font-semibold' : 'text-lg font-medium'} ${tone === 'bad' ? 'text-red-700' : ''}`}
      >
        {value}
      </p>
    </div>
  );
}
