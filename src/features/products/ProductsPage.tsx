import { Link } from 'react-router-dom';
import { errorMessage } from '../../api/errors';
import type { AdminProduct } from '../../api/products';
import { Button } from '../../components/Button';
import { PlusIcon } from '../../components/icons';
import { RetryButton, StateMessage } from '../../components/StateMessage';
import { Badge } from '../../components/ui/Badge';
import { DataList, type Column } from '../../components/ui/DataList';
import { PageHeader } from '../../components/ui/PageHeader';
import { Pagination } from '../../components/ui/Pagination';
import { SearchBox } from '../../components/ui/SearchBox';
import { Select } from '../../components/ui/Select';
import { ListSkeleton } from '../../components/ui/Skeleton';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useListParams, useSearchInput } from '../../hooks/useListParams';
import { formatINR } from '../../utils/money';
import { useCategories } from '../categories/queries';
import { useProducts } from './queries';

const PAGE_SIZE = 20;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function StockCell({ product }: { product: AdminProduct }) {
  if (product.stockQty <= 0) return <Badge tone="bad">Out of stock</Badge>;
  if (product.stockQty <= product.lowStockAt)
    return <Badge tone="warn">Low: {product.stockQty}</Badge>;
  return <span>{product.stockQty}</span>;
}

export function ProductsPage() {
  useDocumentTitle('Products');
  const { page, values, set, clear } = useListParams(['search', 'categoryId', 'isActive']);
  const search = useSearchInput(values.search, (value) => set({ search: value }, true));
  const categoryId = UUID.test(values.categoryId) ? values.categoryId : '';
  const isActive = values.isActive === 'true' || values.isActive === 'false' ? values.isActive : '';

  const categories = useCategories();
  const list = useProducts({
    page,
    limit: PAGE_SIZE,
    ...(values.search ? { search: values.search } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(isActive ? { isActive } : {}),
  });

  const filtered = values.search !== '' || categoryId !== '' || isActive !== '';
  const clearFilters = () => {
    search.reset();
    clear();
  };

  const columns: Column<AdminProduct>[] = [
    {
      header: 'Product',
      cell: (p) => (
        <div className="min-w-0">
          <Link to={`/admin/products/${p.id}`} className="font-semibold hover:underline">
            {p.name}
          </Link>
          <p className="text-muted">{p.sku ?? 'No SKU'}</p>
        </div>
      ),
    },
    { header: 'Category', cell: (p) => p.category.name },
    {
      header: 'Price',
      align: 'right',
      cell: (p) => (
        <div>
          {formatINR(p.sellingPrice)}
          {!p.showPrice ? <p className="text-xs text-muted">Hidden in shop</p> : null}
        </div>
      ),
    },
    { header: 'Stock', align: 'right', cell: (p) => <StockCell product={p} /> },
    {
      header: 'Shop',
      cell: (p) => (p.isActive ? <Badge tone="good">Visible</Badge> : <Badge>Hidden</Badge>),
    },
  ];

  return (
    <section>
      <PageHeader
        title="Products"
        description="Everything you sell. Stock changes through purchases, sales and stock adjustments."
        action={
          <Link
            to="/admin/products/new"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-oud px-4 font-medium text-white transition hover:bg-oud/90"
          >
            <PlusIcon className="mr-1.5" />
            Add product
          </Link>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_14rem_12rem]">
        <div className="sm:col-span-2 lg:col-span-1">
          <SearchBox
            id="product-search"
            label="Search products by name or SKU"
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
          label="Shop visibility"
          hideLabel
          value={isActive}
          onChange={(e) => set({ isActive: e.target.value })}
        >
          <option value="">Visible and hidden</option>
          <option value="true">Visible in shop</option>
          <option value="false">Hidden from shop</option>
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
          title="Couldn't load the products"
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
            title="No products found"
            message="Try a different word or filter."
            action={<Button onClick={clearFilters}>Clear search and filters</Button>}
          />
        ) : (
          <StateMessage
            title="No products yet"
            message="Add your first product to show it in the shop."
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
            label="Products"
            items={list.data.items}
            getKey={(p) => p.id}
            columns={columns}
            renderCard={(p) => (
              <Link to={`/admin/products/${p.id}`} className="block space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-sm text-muted">
                      {p.category.name}
                      {p.sku ? ` · ${p.sku}` : ''}
                    </p>
                  </div>
                  {!p.isActive ? <Badge>Hidden</Badge> : null}
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold tabular-nums">{formatINR(p.sellingPrice)}</span>
                  <span className="flex items-center gap-1.5 text-muted">
                    Stock <StockCell product={p} />
                  </span>
                </div>
              </Link>
            )}
          />
          <Pagination
            page={page}
            totalPages={list.data.meta.totalPages}
            onChange={(next) => set({ page: next > 1 ? String(next) : '' })}
          />
        </div>
      )}
    </section>
  );
}
