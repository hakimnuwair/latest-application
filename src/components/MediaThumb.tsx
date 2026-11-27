import { useState } from 'react';
import type { PublicMedia } from '../api/public';
import { BoxIcon, PlayIcon } from './icons';
import { imageSrcSet, imageUrl, videoPoster } from '../utils/media';

interface Props {
  media: PublicMedia | undefined;
  alt: string;
  /** Widths (px) to offer the browser. The largest is also the fallback `src`. */
  widths: number[];
  sizes: string;
  fit?: 'cover' | 'contain';
  eager?: boolean;
}

/** One picture on a calm backdrop. Fades in when loaded; shows a neutral placeholder if there is no picture. */
export function MediaThumb({ media, alt, widths, sizes, fit = 'cover', eager = false }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const largest = Math.max(...widths);
  const src =
    media === undefined
      ? undefined
      : media.type === 'IMAGE'
        ? imageUrl(media.url, largest)
        : videoPoster(media.url, largest);
  const srcSet = media?.type === 'IMAGE' ? imageSrcSet(media.url, widths) : undefined;

  if (!src || failed) {
    if (media?.type === 'VIDEO') {
      return (
        <div
          className="grid size-full place-items-center bg-ink text-white/80"
          role="img"
          aria-label={alt}
        >
          <PlayIcon width={28} height={28} />
        </div>
      );
    }
    return (
      <div
        className="grid size-full place-items-center bg-plinth text-muted/60"
        role="img"
        aria-label={alt}
      >
        <BoxIcon width={40} height={40} />
      </div>
    );
  }

  return (
    <img
      src={src}
      {...(srcSet ? { srcSet, sizes } : {})}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      {...(eager ? { fetchPriority: 'high' as const } : {})}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      className={`size-full bg-plinth transition-opacity duration-500 motion-reduce:transition-none ${
        fit === 'cover' ? 'object-cover' : 'object-contain'
      } ${loaded ? 'opacity-100' : 'opacity-0'}`}
    />
  );
}
