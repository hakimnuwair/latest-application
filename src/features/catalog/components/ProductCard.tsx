import { Link, useLocation } from 'react-router-dom';
import type { PublicProduct } from '../../../api/public';
import { PlayIcon } from '../../../components/icons';
import { coverOf } from '../../../utils/media';
import { formatINR } from '../../../utils/money';
import { MediaThumb } from './MediaThumb';

/** The photo is the hero of the card; text stays quiet underneath. A hidden price simply is not shown. */
export function ProductCard({ product }: { product: PublicProduct }) {
  const location = useLocation();
  const hasVideo = product.media.some((m) => m.type === 'VIDEO');

  return (
    <Link
      to={`/products/${encodeURIComponent(product.slug)}`}
      state={{ from: location.search }}
      className="group block rounded-2xl"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-plinth">
        <div className="size-full transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100">
          <MediaThumb
            media={coverOf(product.media)}
            alt={product.name}
            widths={[320, 480, 640]}
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          />
        </div>
        {!product.inStock ? (
          <span className="absolute top-2.5 left-2.5 rounded-full bg-ink/85 px-2.5 py-1 text-xs font-semibold text-white">
            Out of stock
          </span>
        ) : null}
        {hasVideo ? (
          <span className="absolute right-2.5 bottom-2.5 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink">
            <PlayIcon width={10} height={10} />
            Video
          </span>
        ) : null}
      </div>
      <div className="mt-3 space-y-0.5 px-0.5">
        <p className="truncate text-xs text-muted">{product.category.name}</p>
        <h3 className="line-clamp-2 font-display text-xl leading-snug text-balance">
          {product.name}
        </h3>
        {product.price !== undefined ? (
          <p className="pt-0.5 text-sm font-semibold text-brass tabular-nums">
            {formatINR(product.price)}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true" className="animate-pulse">
      <div className="aspect-[4/5] rounded-2xl bg-plinth" />
      <div className="mt-3 space-y-2 px-0.5">
        <div className="h-3 w-1/3 rounded bg-plinth" />
        <div className="h-5 w-4/5 rounded bg-plinth" />
      </div>
    </div>
  );
}
