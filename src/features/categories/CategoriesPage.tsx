import { useState } from 'react';
import { errorMessage } from '../../api/errors';
import type { Category } from '../../api/categories';
import { Button } from '../../components/Button';
import { EditIcon, PlusIcon, TrashIcon, UndoIcon } from '../../components/icons';
import { RetryButton, StateMessage } from '../../components/StateMessage';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataList, type Column } from '../../components/ui/DataList';
import { PageHeader } from '../../components/ui/PageHeader';
import { Segmented } from '../../components/ui/Segmented';
import { ListSkeleton } from '../../components/ui/Skeleton';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../hooks/useToast';
import { CategoryFormModal } from './CategoryFormModal';
import { useCategories, useDeleteCategory, useRestoreCategory } from './queries';

type View = 'active' | 'deleted';
const VIEWS = [
  { value: 'active', label: 'Active' },
  { value: 'deleted', label: 'Deleted' },
] as const;

export function CategoriesPage() {
  useDocumentTitle('Categories');
  const toast = useToast();
  const [view, setView] = useState<View>('active');
  const list = useCategories(view === 'deleted');
  const remove = useDeleteCategory();
  const restore = useRestoreCategory();

  const [editing, setEditing] = useState<Category | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const openForm = (category: Category | null) => {
    setEditing(category);
    setFormOpen(true);
  };

  const doRestore = async (category: Category) => {
    try {
      await restore.mutateAsync(category.id);
      toast.success(`"${category.name}" restored`);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const actions = (category: Category) =>
    view === 'active' ? (
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() => openForm(category)}
          aria-label={`Rename ${category.name}`}
        >
          <EditIcon className="mr-1.5" />
          Rename
        </Button>
        <Button
          variant="secondary"
          onClick={() => setDeleting(category)}
          aria-label={`Delete ${category.name}`}
        >
          <TrashIcon className="mr-1.5" />
          Delete
        </Button>
      </div>
    ) : (
      <Button
        variant="secondary"
        loading={restore.isPending && restore.variables === category.id}
        onClick={() => void doRestore(category)}
        aria-label={`Restore ${category.name}`}
      >
        <UndoIcon className="mr-1.5" />
        Restore
      </Button>
    );

  const columns: Column<Category>[] = [
    { header: 'Name', cell: (c) => <span className="font-medium">{c.name}</span> },
    { header: 'Products', align: 'right', cell: (c) => c.productCount },
    {
      header: 'Actions',
      align: 'right',
      cell: (c) => <div className="flex justify-end">{actions(c)}</div>,
    },
  ];

  return (
    <section>
      <PageHeader
        title="Categories"
        description="Group your products. Shoppers can filter the shop by category."
        action={
          <Button onClick={() => openForm(null)}>
            <PlusIcon className="mr-1.5" />
            Add category
          </Button>
        }
      />

      <div className="mb-4">
        <Segmented ariaLabel="Show categories" value={view} options={VIEWS} onChange={setView} />
      </div>

      {list.isPending ? (
        <ListSkeleton rows={5} />
      ) : list.isError ? (
        <StateMessage
          title="Couldn't load the categories"
          message={errorMessage(list.error)}
          action={<RetryButton onClick={() => void list.refetch()} />}
        />
      ) : list.data.length === 0 ? (
        view === 'active' ? (
          <StateMessage
            title="No categories yet"
            message="Add your first category, then you can add products to it."
            action={<Button onClick={() => openForm(null)}>Add category</Button>}
          />
        ) : (
          <StateMessage
            title="Nothing deleted"
            message="Deleted categories show up here so you can restore them."
          />
        )
      ) : (
        <DataList
          label="Categories"
          items={list.data}
          getKey={(c) => c.id}
          columns={columns}
          renderCard={(c) => (
            <div className="space-y-3">
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-sm text-muted">
                  {c.productCount} {c.productCount === 1 ? 'product' : 'products'}
                </p>
              </div>
              {actions(c)}
            </div>
          )}
        />
      )}

      <CategoryFormModal open={formOpen} category={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={deleting !== null}
        title="Delete category"
        message={`Delete "${deleting?.name ?? ''}"? It disappears from the shop filters. You can restore it later from the Deleted list.`}
        confirmLabel="Delete category"
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
