import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { errorMessage, isNotFound } from '../../api/errors';
import type { LedgerEntry } from '../../api/parties';
import { Button } from '../../components/Button';
import { ArrowLeftIcon, EditIcon, PhoneIcon, TrashIcon } from '../../components/icons';
import { RetryButton, StateMessage } from '../../components/StateMessage';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataList, type Column } from '../../components/ui/DataList';
import { PageHeader } from '../../components/ui/PageHeader';
import { Pagination } from '../../components/ui/Pagination';
import { ListSkeleton } from '../../components/ui/Skeleton';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useListParams } from '../../hooks/useListParams';
import { useToast } from '../../hooks/useToast';
import { formatDateTime } from '../../utils/dates';
import { formatINR } from '../../utils/money';
import { PaymentModal } from './PaymentModal';
import { useDeletePayment, useLedger } from './queries';
import type { PartyConfig } from './types';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NO_KEYS = [] as const;
const MODE_LABEL = { CASH: 'Cash', ONLINE: 'Online', CREDIT: 'Credit' } as const;

const iconButton =
  'grid size-11 place-items-center rounded-lg border border-line bg-white text-ink transition hover:bg-oud-soft';

/** One customer's or supplier's ledger: the balance, every line with the running balance, and payments. */
export function LedgerPage({ config }: { config: PartyConfig }) {
  const { id = '' } = useParams();
  const validId = UUID.test(id);
  return validId ? <LedgerBody config={config} id={id} /> : <MissingParty config={config} />;
}

const backLink = (config: PartyConfig) => (
  <Link
    to={config.base}
    className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-muted hover:text-ink"
  >
    <ArrowLeftIcon width={18} height={18} />
    All {config.title.toLowerCase()}
  </Link>
);

function MissingParty({ config }: { config: PartyConfig }) {
  useDocumentTitle(`${config.title}`);
  return (
    <section>
      {backLink(config)}
      <StateMessage
        title={`${config.singular[0]?.toUpperCase() ?? ''}${config.singular.slice(1)} not found`}
        message="It may have been deleted, or the link is wrong."
        action={
          <Link
            to={config.base}
            className="inline-flex min-h-11 items-center rounded-lg bg-oud px-4 font-medium text-white"
          >
            Go to {config.title.toLowerCase()}
          </Link>
        }
      />
    </section>
  );
}

function LedgerBody({ config, id }: { config: PartyConfig; id: string }) {
  const toast = useToast();
  const { page, set } = useListParams(NO_KEYS);
  const ledger = useLedger(config, id, page);
  const removePayment = useDeletePayment(config, id);
  useDocumentTitle(ledger.data ? `${ledger.data.party.name}` : config.title);

  const [paying, setPaying] = useState(false);
  const [editing, setEditing] = useState<LedgerEntry | null>(null);
  const [deleting, setDeleting] = useState<LedgerEntry | null>(null);

  if (ledger.isPending) {
    return (
      <section>
        {backLink(config)}
        <ListSkeleton rows={4} />
      </section>
    );
  }
  if (ledger.isError) {
    return isNotFound(ledger.error) ? (
      <MissingParty config={config} />
    ) : (
      <section>
        {backLink(config)}
        <StateMessage
          title="Couldn't load the ledger"
          message={errorMessage(ledger.error)}
          action={<RetryButton onClick={() => void ledger.refetch()} />}
        />
      </section>
    );
  }

  const { party, balance, openingBalance, entries, meta } = ledger.data;
  const owed = balance > 0;
  const canPay = owed;

  const entryTitle = (e: LedgerEntry) => {
    const label = e.type === 'PAYMENT' ? config.paymentEntryLabel : config.chargeEntryLabel;
    const link = e.type === 'PAYMENT' ? undefined : config.chargeLink?.(e.refId);
    return link ? (
      <Link to={link} className="font-semibold text-oud hover:underline">
        {label}
      </Link>
    ) : (
      <span className="font-semibold">{label}</span>
    );
  };

  const entryDetail = (e: LedgerEntry) => {
    if (e.type === 'PAYMENT') {
      return `${MODE_LABEL[e.mode]}${e.note ? ` · ${e.note}` : ''}`;
    }
    return `Total ${formatINR(e.totalAmount ?? 0)} · paid ${formatINR(e.amountPaid ?? 0)} · ${MODE_LABEL[e.mode]}`;
  };

  const change = (e: LedgerEntry) =>
    e.decrease > 0 ? (
      <span className="font-semibold text-emerald-800 tabular-nums">−{formatINR(e.decrease)}</span>
    ) : e.increase > 0 ? (
      <span className="font-semibold text-red-700 tabular-nums">+{formatINR(e.increase)}</span>
    ) : (
      <span className="text-muted">No change</span>
    );

  const actions = (e: LedgerEntry) =>
    e.type === 'PAYMENT' ? (
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`Edit payment of ${formatINR(e.decrease)}`}
          onClick={() => setEditing(e)}
          className={iconButton}
        >
          <EditIcon />
        </button>
        <button
          type="button"
          aria-label={`Delete payment of ${formatINR(e.decrease)}`}
          onClick={() => setDeleting(e)}
          className={iconButton}
        >
          <TrashIcon />
        </button>
      </div>
    ) : null;

  const columns: Column<LedgerEntry>[] = [
    { header: 'Date', cell: (e) => <span className="text-muted">{formatDateTime(e.date)}</span> },
    {
      header: 'Entry',
      cell: (e) => (
        <div className="min-w-0">
          {entryTitle(e)}
          <p className="text-muted">{entryDetail(e)}</p>
        </div>
      ),
    },
    { header: 'Change', align: 'right', cell: change },
    {
      header: 'Balance',
      align: 'right',
      cell: (e) => <span className="font-semibold">{formatINR(e.balance)}</span>,
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (e) => <div className="flex justify-end">{actions(e)}</div>,
    },
  ];

  return (
    <section>
      <PageHeader
        title={party.name}
        back={backLink(config)}
        description={party.phone ?? undefined}
        action={
          // Phone has its own button in the bottom bar (below), so this one shows from 768px.
          <div className="hidden md:block">
            <Button onClick={() => setPaying(true)} disabled={!canPay}>
              {config.payLabel}
            </Button>
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-line bg-white p-4 sm:p-5">
        <div>
          <p className="text-sm text-muted">{config.owedHeading}</p>
          <p
            className={`font-display text-4xl leading-tight tabular-nums ${owed ? 'text-red-700' : ''}`}
          >
            {formatINR(balance)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 text-sm">
          {owed ? null : <Badge tone="good">{config.settledText}</Badge>}
          {party.phone ? (
            <a
              href={`tel:${party.phone}`}
              className="inline-flex min-h-11 items-center gap-1.5 text-oud"
            >
              <PhoneIcon width={16} height={16} />
              Call {party.phone}
            </a>
          ) : null}
        </div>
      </div>

      {entries.length === 0 ? (
        <StateMessage
          title="No entries yet"
          message={
            config.kind === 'customer'
              ? 'Sales to this customer and their payments will show up here.'
              : 'Purchases from this supplier and your payments will show up here.'
          }
        />
      ) : (
        <div className={ledger.isPlaceholderData ? 'opacity-60 transition-opacity' : ''}>
          {page > 1 ? (
            <p className="mb-2 text-sm text-muted">
              Balance brought forward:{' '}
              <strong className="text-ink">{formatINR(openingBalance)}</strong>
            </p>
          ) : null}
          <DataList
            label={`${party.name} ledger`}
            items={entries}
            getKey={(e) => `${e.type}-${e.refId}`}
            columns={columns}
            renderCard={(e) => (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {entryTitle(e)}
                    <p className="text-sm text-muted">{formatDateTime(e.date)}</p>
                  </div>
                  <div className="text-right">{change(e)}</div>
                </div>
                <p className="text-sm text-muted">{entryDetail(e)}</p>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm">
                    <span className="text-muted">Balance </span>
                    <span className="font-semibold tabular-nums">{formatINR(e.balance)}</span>
                  </p>
                  {actions(e)}
                </div>
              </div>
            )}
          />
          <Pagination
            page={page}
            totalPages={meta.totalPages}
            onChange={(next) => set({ page: next > 1 ? String(next) : '' })}
          />
        </div>
      )}

      {/* Phone: the main action sits above the bottom bar, within thumb reach. */}
      <div className="sticky bottom-20 z-10 mt-6 md:hidden">
        <Button className="w-full shadow-lg" onClick={() => setPaying(true)} disabled={!canPay}>
          {config.payLabel}
        </Button>
      </div>

      <PaymentModal
        open={paying || editing !== null}
        config={config}
        partyId={id}
        outstanding={balance}
        entry={editing}
        onClose={() => {
          setPaying(false);
          setEditing(null);
        }}
      />
      <ConfirmDialog
        open={deleting !== null}
        title="Delete payment"
        message={`Delete the payment of ${formatINR(deleting?.decrease ?? 0)} from ${deleting ? formatDateTime(deleting.date) : ''}? The amount counts as ${config.kind === 'customer' ? 'owed to you' : 'owed by you'} again.`}
        confirmLabel="Delete payment"
        danger
        onConfirm={async () => {
          if (!deleting) return;
          const result = await removePayment.mutateAsync(deleting.refId);
          toast.success(`Payment deleted. ${config.afterText(result.outstandingAfter)}`);
        }}
        onClose={() => setDeleting(null)}
      />
    </section>
  );
}
