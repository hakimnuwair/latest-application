import { useRef } from 'react';
import { Button } from '../../components/Button';
import { errorMessage } from '../../api/errors';
import { Pagination } from '../../components/ui/Pagination';
import { SearchBox } from '../../components/ui/SearchBox';
import { RetryButton, StateMessage } from '../../components/StateMessage';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useListParams, useSearchInput } from '../../hooks/useListParams';
import { CategoryChips } from './components/CategoryChips';
import { CatalogShell } from './components/CatalogShell';
import { ProductCard, ProductCardSkeleton } from './components/ProductCard';
import { usePublicCategories, usePublicProducts } from './queries';

// 12 divides evenly into the 2, 3 and 4 column layouts, so the last row is never half empty.
const PAGE_SIZE = 12;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The URL is the source of truth (?q=watch&category=<id>&page=2), so a filtered view can be shared,
 * bookmarked, and survives the Back button after opening a product.
 */
export function CatalogPage() {
  useDocumentTitle();
  const { page, values, set, clear } = useListParams(['q', 'category']);
  const q = values.q;
  const categoryId = UUID.test(values.category) ? values.category : '';

  const gridTop = useRef<HTMLDivElement>(null);
  const search = useSearchInput(q, (value) => set({ q: value }, true));

  const clearFilters = () => {
    search.reset();
    clear();
  };
  const goToPage = (next: number) => {
    set({ page: next > 1 ? String(next) : '' });
    gridTop.current?.scrollIntoView({ block: 'start' });
  };

  const products = usePublicProducts({
    page,
    limit: PAGE_SIZE,
    search: q || undefined,
    categoryId: categoryId || undefined,
  });
  const categories = usePublicCategories();

  const filtered = q !== '' || categoryId !== '';
  const total = products.data?.meta.total;
  const items = products.data?.items ?? [];

  return (
    <CatalogShell>
      <h1 className="font-display text-4xl leading-tight text-balance sm:text-5xl">Our products</h1>

      {/* Stays at the top while scrolling, so search and categories are always one tap away. */}
      <div className="sticky top-0 z-10 -mx-4 mt-4 space-y-3 border-b border-line bg-mist/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:flex lg:items-center lg:gap-6 lg:space-y-0">
        <div className="lg:w-80 lg:shrink-0">
          <SearchBox value={search.text} onChange={search.onChange} onSubmit={search.submit} />
        </div>
        {categories.data && categories.data.length > 0 ? (
          <div className="min-w-0 lg:flex-1">
            <CategoryChips
              categories={categories.data}
              selectedId={categoryId}
              onSelect={(id) => set({ category: id })}
            />
          </div>
        ) : null}
      </div>

      <div ref={gridTop} className="pt-5">
        <p className="mb-4 min-h-5 text-sm text-muted" aria-live="polite">
          {total === undefined
            ? ''
            : q
              ? `${total} ${total === 1 ? 'result' : 'results'} for “${q}”`
              : `${total} ${total === 1 ? 'product' : 'products'}`}
        </p>

        {products.isPending ? (
          <Grid>
            {Array.from({ length: 8 }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </Grid>
        ) : products.isError ? (
          <StateMessage
            title="Couldn't load the products"
            message={errorMessage(products.error)}
            action={<RetryButton onClick={() => void products.refetch()} />}
          />
        ) : items.length === 0 ? (
          page > 1 ? (
            <StateMessage
              title="That page is empty"
              action={<Button onClick={() => goToPage(1)}>Back to page 1</Button>}
            />
          ) : filtered ? (
            <StateMessage
              title="No products found"
              message="Try a different word or another category."
              action={<Button onClick={clearFilters}>Clear search and filters</Button>}
            />
          ) : (
            <StateMessage
              title="Nothing here yet"
              message="New products are added soon. Please check back."
            />
          )
        ) : (
          <div className={products.isPlaceholderData ? 'opacity-60 transition-opacity' : ''}>
            <Grid>
              {items.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </Grid>
            <Pagination
              page={page}
              totalPages={products.data?.meta.totalPages ?? 1}
              onChange={goToPage}
            />
          </div>
        )}
      </div>
    </CatalogShell>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
      {children}
    </div>
  );
}
