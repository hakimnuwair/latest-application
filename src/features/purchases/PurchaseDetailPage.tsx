import { Link, useParams } from 'react-router-dom';
import { errorMessage, isNotFound } from '../../api/errors';
import type { PurchaseLine } from '../../api/purchases';
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
import { MODE_LABEL } from '../sales/schema';
import { usePurchase } from './queries';

const back = (
  <Link to="/admin/purchases" className="text-sm text-muted hover:text-ink">
    All purchases
  </Link>
);

/** One saved purchase, exactly as the server stored it. Nothing is calculated here. */
export function PurchaseDetailPage() {
  useDocumentTitle('Purchase');
  const { id = '' } = useParams();
  const purchase = usePurchase(id);

  if (purchase.isPending) {
    return (
      <section>
        <PageHeader title="Purchase" back={back} />
        <Skeleton className="h-40 w-full" />
      </section>
    );
  }
  if (purchase.isError) {
    return (
      <section>
        <PageHeader title="Purchase" back={back} />
        {isNotFound(purchase.error) ? (
          <StateMessage
            title="Purchase not found"
            message="It may have been removed, or the link is wrong."
            action={
              <Link to="/admin/purchases">
                <Button>Back to purchases</Button>
              </Link>
            }
          />
        ) : (
          <StateMessage
            title="Couldn't load this purchase"
            message={errorMessage(purchase.error)}
            action={<RetryButton onClick={() => void purchase.refetch()} />}
          />
        )}
      </section>
    );
  }

  const s = purchase.data;
  const columns: Column<PurchaseLine>[] = [
    { header: 'Product', cell: (l) => <span className="font-medium">{l.productName}</span> },
    { header: 'Qty', align: 'right', cell: (l) => l.qty },
    { header: 'Unit cost', align: 'right', cell: (l) => formatINR(l.unitCost) },
    {
      header: 'Total',
      align: 'right',
      cell: (l) => <span className="font-semibold">{formatINR(l.lineTotal)}</span>,
    },
  ];

  return (
    <section>
      <PageHeader
        title="Purchase"
        description={formatDateTime(s.purchasedAt)}
        back={back}
        action={
          <Link to="/admin/purchases/new">
            <Button>
              <PlusIcon className="mr-1.5" />
              New purchase
            </Button>
          </Link>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total" value={formatINR(s.totalAmount)} strong />
        <Stat label="Paid" value={formatINR(s.amountPaid)} />
        <Stat
          label="Still to pay"
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
        <span className="text-muted">Supplier: </span>
        {s.supplier ? (
          <Link
            to={`/admin/suppliers/${s.supplier.id}`}
            className="font-semibold text-oud hover:underline"
          >
            {s.supplier.name}
          </Link>
        ) : (
          <span className="font-medium">No supplier recorded</span>
        )}
      </p>

      <DataList
        label="Items bought"
        items={s.items}
        getKey={(l) => l.id}
        columns={columns}
        renderCard={(l) => (
          <div className="space-y-1">
            <p className="font-semibold break-words">{l.productName}</p>
            <p className="text-sm text-muted tabular-nums">
              {l.qty} × {formatINR(l.unitCost)}
            </p>
            <p className="text-right font-semibold tabular-nums">{formatINR(l.lineTotal)}</p>
          </div>
        )}
      />

      <div className="sticky bottom-20 z-10 mt-6 md:hidden">
        <Link to="/admin/purchases/new" className="block">
          <Button className="w-full shadow-lg">New purchase</Button>
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
