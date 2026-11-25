import { Link, useLocation, useParams } from 'react-router-dom';
import { errorMessage } from '../../api/errors';
import { ChevronLeftIcon } from '../../components/icons';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatINR } from '../../utils/money';
import { CatalogShell } from './components/CatalogShell';
import { Gallery } from './components/Gallery';
import { RetryButton, StateMessage } from './components/States';
import { isNotFound, usePublicProduct } from './queries';

export function ProductPage() {
  const { slug = '' } = useParams();
  const location = useLocation();
  const product = usePublicProduct(slug);
  useDocumentTitle(product.data?.name);

  // Back goes to the filtered list the visitor came from (search, category, page).
  const from = (location.state as { from?: unknown } | null)?.from;
  const backTo = `/${typeof from === 'string' ? from : ''}`;

  const back = (
    <Link
      to={backTo}
      className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-muted hover:text-ink"
    >
      <ChevronLeftIcon width={18} height={18} />
      All products
    </Link>
  );

  if (product.isPending) {
    return (
      <CatalogShell>
        {back}
        <div
          className="grid animate-pulse gap-8 lg:grid-cols-2"
          aria-busy="true"
          aria-label="Loading product"
        >
          <div className="aspect-[4/5] rounded-3xl bg-plinth" />
          <div className="space-y-4">
            <div className="h-4 w-24 rounded bg-plinth" />
            <div className="h-10 w-3/4 rounded bg-plinth" />
            <div className="h-6 w-32 rounded bg-plinth" />
          </div>
        </div>
      </CatalogShell>
    );
  }

  if (product.isError) {
    return (
      <CatalogShell>
        {back}
        {isNotFound(product.error) ? (
          <StateMessage
            title="Product not found"
            message="It may have been removed or the link is wrong."
            action={
              <Link
                to="/"
                className="inline-flex min-h-11 items-center rounded-lg bg-oud px-4 font-medium text-white"
              >
                See all products
              </Link>
            }
          />
        ) : (
          <StateMessage
            title="Couldn't load this product"
            message={errorMessage(product.error)}
            action={<RetryButton onClick={() => void product.refetch()} />}
          />
        )}
      </CatalogShell>
    );
  }

  const p = product.data;

  return (
    <CatalogShell>
      {back}
      <article className="grid gap-8 pt-1 lg:grid-cols-2 lg:gap-14">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <Gallery key={p.slug} media={p.media} name={p.name} />
        </div>

        <div className="space-y-6 lg:pt-4">
          <div className="space-y-3">
            <Link
              to={`/?category=${encodeURIComponent(p.category.id)}`}
              className="inline-flex min-h-11 items-center rounded-full bg-oud-soft px-4 text-sm font-semibold text-oud hover:bg-oud-soft/70"
            >
              {p.category.name}
            </Link>
            <h1 className="font-display text-4xl leading-tight text-balance sm:text-5xl">
              {p.name}
            </h1>
          </div>

          <div className="space-y-3">
            {p.price !== undefined ? (
              <p className="text-3xl font-semibold text-brass tabular-nums">{formatINR(p.price)}</p>
            ) : (
              <p className="text-lg text-muted">Ask in the shop for the price</p>
            )}
            <p className="flex items-center gap-2 text-sm font-semibold">
              <span
                aria-hidden="true"
                className={`size-2.5 rounded-full ${p.inStock ? 'bg-emerald-600' : 'bg-red-600'}`}
              />
              {!p.inStock
                ? 'Out of stock'
                : p.quantity !== undefined
                  ? `In stock, ${p.quantity} available`
                  : 'In stock'}
            </p>
          </div>

          {p.description ? (
            <div className="border-t border-line pt-6">
              <h2 className="sr-only">Description</h2>
              <p className="max-w-prose text-base leading-7 whitespace-pre-line text-ink/85">
                {p.description}
              </p>
            </div>
          ) : null}
        </div>
      </article>
    </CatalogShell>
  );
}
