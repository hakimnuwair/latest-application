import { useState } from 'react';
import { Link } from 'react-router-dom';
import { errorMessage } from '../../api/errors';
import type { Party } from '../../api/parties';
import { Button } from '../../components/Button';
import { EditIcon, PhoneIcon, PlusIcon, TrashIcon } from '../../components/icons';
import { RetryButton, StateMessage } from '../../components/StateMessage';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataList, type Column } from '../../components/ui/DataList';
import { PageHeader } from '../../components/ui/PageHeader';
import { Pagination } from '../../components/ui/Pagination';
import { SearchBox } from '../../components/ui/SearchBox';
import { ListSkeleton } from '../../components/ui/Skeleton';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useListParams, useSearchInput } from '../../hooks/useListParams';
import { useToast } from '../../hooks/useToast';
import { formatINR } from '../../utils/money';
import { PartyFormModal } from './PartyFormModal';
import { useDeleteParty, usePartyList } from './queries';
import type { PartyConfig } from './types';

const KEYS = ['search'] as const;
const PAGE_SIZE = 20;

const iconButton =
  'grid size-11 place-items-center rounded-lg border border-line bg-white text-ink transition hover:bg-oud-soft';

/** The list of customers or suppliers with the balance of each. One screen for both (see PartyConfig). */
export function PartyListPage({ config }: { config: PartyConfig }) {
  useDocumentTitle(config.title);
  const toast = useToast();
  const { page, values, set, clear } = useListParams(KEYS);
  const search = useSearchInput(values.search, (value) => set({ search: value }, true));
  const list = usePartyList(config, {
    page,
    limit: PAGE_SIZE,
    ...(values.search ? { search: values.search } : {}),
  });
  const remove = useDeleteParty(config);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Party | null>(null);
  const [deleting, setDeleting] = useState<Party | null>(null);

  const openForm = (party: Party | null) => {
    setEditing(party);
    setFormOpen(true);
  };

  const balance = (party: Party) =>
    party.outstanding > 0 ? (
      <span className="font-semibold text-red-700 tabular-nums">
        {formatINR(party.outstanding)}
      </span>
    ) : (
      <Badge tone="good">Settled</Badge>
    );

  const actions = (party: Party) => (
    <div className="flex items-center gap-2">
      <Link
        to={`${config.base}/${party.id}`}
        aria-label={`Open ledger of ${party.name}`}
        className="inline-flex min-h-11 items-center rounded-lg border border-line bg-white px-4 text-base font-medium transition hover:bg-oud-soft"
      >
        Ledger
      </Link>
      <button
        type="button"
        aria-label={`Edit ${party.name}`}
        onClick={() => openForm(party)}
        className={iconButton}
      >
        <EditIcon />
      </button>
      <button
        type="button"
        aria-label={`Delete ${party.name}`}
        onClick={() => setDeleting(party)}
        className={iconButton}
      >
        <TrashIcon />
      </button>
    </div>
  );

  const columns: Column<Party>[] = [
    {
      header: 'Name',
      cell: (p) => (
        <Link
          to={`${config.base}/${p.id}`}
          className="font-semibold hover:text-oud hover:underline"
        >
          {p.name}
        </Link>
      ),
    },
    { header: 'Phone', cell: (p) => p.phone ?? <span className="text-muted">Not set</span> },
    { header: config.owedHeading, align: 'right', cell: balance },
    {
      header: 'Actions',
      align: 'right',
      cell: (p) => <div className="flex justify-end">{actions(p)}</div>,
    },
  ];

  const filtered = values.search !== '';

  return (
    <section>
      <PageHeader
        title={config.title}
        description={config.description}
        action={
          <Button onClick={() => openForm(null)}>
            <PlusIcon className="mr-1.5" />
            {config.addLabel}
          </Button>
        }
      />

      <div className="mb-4">
        <SearchBox
          id={`${config.kind}-search`}
          label={`Search ${config.title.toLowerCase()}`}
          placeholder={config.searchPlaceholder}
          value={search.text}
          onChange={search.onChange}
          onSubmit={search.submit}
        />
      </div>

      <p className="mb-3 min-h-5 text-sm text-muted" aria-live="polite">
        {list.data
          ? `${list.data.meta.total} ${list.data.meta.total === 1 ? config.singular : config.title.toLowerCase()}`
          : ''}
      </p>

      {list.isPending ? (
        <ListSkeleton />
      ) : list.isError ? (
        <StateMessage
          title={`Couldn't load the ${config.title.toLowerCase()}`}
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
            message="Try a different name or phone number."
            action={
              <Button
                onClick={() => {
                  search.reset();
                  clear();
                }}
              >
                Clear search
              </Button>
            }
          />
        ) : (
          <StateMessage
            title={`No ${config.title.toLowerCase()} yet`}
            message={config.emptyMessage}
            action={<Button onClick={() => openForm(null)}>{config.addLabel}</Button>}
          />
        )
      ) : (
        <div className={list.isPlaceholderData ? 'opacity-60 transition-opacity' : ''}>
          <DataList
            label={config.title}
            items={list.data.items}
            getKey={(p) => p.id}
            columns={columns}
            renderCard={(p) => (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to={`${config.base}/${p.id}`}
                      className="flex min-h-11 items-center text-base leading-snug break-words font-semibold hover:text-oud"
                    >
                      {p.name}
                    </Link>
                    {p.phone ? (
                      <a
                        href={`tel:${p.phone}`}
                        className="-mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm text-muted"
                      >
                        <PhoneIcon width={15} height={15} />
                        {p.phone}
                      </a>
                    ) : (
                      <p className="text-sm text-muted">No phone</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted">{config.owedHeading}</p>
                    <div className="text-lg">{balance(p)}</div>
                  </div>
                </div>
                {actions(p)}
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

      <PartyFormModal
        open={formOpen}
        config={config}
        party={editing}
        onClose={() => setFormOpen(false)}
      />
      <ConfirmDialog
        open={deleting !== null}
        title={`Delete ${config.singular}`}
        message={`Delete "${deleting?.name ?? ''}"? They disappear from this list. If money is still owed, the shop will not allow it.`}
        confirmLabel={`Delete ${config.singular}`}
        danger
        onConfirm={async () => {
          if (!deleting) return;
          await remove.mutateAsync(deleting.id);
          toast.success(`"${deleting.name}" deleted`);
        }}
        onClose={() => setDeleting(null)}
      />
    </section>
  );
}
