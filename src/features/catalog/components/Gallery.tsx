import { useRef, useState } from 'react';
import type { PublicMedia } from '../../../api/public';
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon } from '../../../components/icons';
import { videoPoster } from '../../../utils/media';
import { MediaThumb } from '../../../components/MediaThumb';

interface Props {
  media: PublicMedia[];
  name: string;
}

/**
 * Photos and videos in one swipeable strip (native scroll-snap, so it feels right on a phone), with arrow
 * buttons and the keyboard arrows for desktop, and a row of thumbnails underneath.
 */
export function Gallery({ media, name }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const last = media.length - 1;

  if (media.length === 0) {
    return (
      <div className="aspect-[4/5] overflow-hidden rounded-3xl">
        <MediaThumb
          media={undefined}
          alt={`${name} has no photo yet`}
          widths={[640]}
          sizes="100vw"
        />
      </div>
    );
  }

  const pauseVideos = () => {
    track.current?.querySelectorAll('video').forEach((v) => v.pause());
  };

  const goTo = (target: number) => {
    const el = track.current;
    if (!el) return;
    const next = Math.min(Math.max(target, 0), last);
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    pauseVideos();
    el.scrollTo({ left: next * el.clientWidth, behavior: calm ? 'auto' : 'smooth' });
    setIndex(next);
  };

  const onScroll = () => {
    const el = track.current;
    if (!el || el.clientWidth === 0) return;
    const now = Math.round(el.scrollLeft / el.clientWidth);
    if (now !== index) {
      pauseVideos();
      setIndex(now);
    }
  };

  const arrow =
    'absolute top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-md transition hover:bg-white disabled:pointer-events-none disabled:opacity-0 md:grid';

  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl bg-plinth">
        <div
          ref={track}
          role="region"
          aria-roledescription="carousel"
          aria-label={`Photos and videos of ${name}`}
          tabIndex={0}
          onScroll={onScroll}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') {
              e.preventDefault();
              goTo(index + 1);
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault();
              goTo(index - 1);
            }
          }}
          className="no-scrollbar flex aspect-[4/5] snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
        >
          {media.map((item, i) => (
            <div
              key={`${item.url}-${i}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${media.length}`}
              className="size-full shrink-0 snap-center snap-always"
            >
              {item.type === 'VIDEO' ? (
                <video
                  controls
                  playsInline
                  preload="metadata"
                  poster={videoPoster(item.url, 1000)}
                  aria-label={`Video of ${name}`}
                  className="size-full bg-ink object-contain"
                >
                  <source src={item.url} />
                  Your browser cannot play this video.
                </video>
              ) : (
                <MediaThumb
                  media={item}
                  alt={`${name}, photo ${i + 1}`}
                  widths={[480, 720, 1000]}
                  sizes="(min-width: 1024px) 560px, 100vw"
                  fit="contain"
                  eager={i === 0}
                />
              )}
            </div>
          ))}
        </div>

        {media.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous"
              disabled={index === 0}
              onClick={() => goTo(index - 1)}
              className={`${arrow} left-3`}
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              aria-label="Next"
              disabled={index === last}
              onClick={() => goTo(index + 1)}
              className={`${arrow} right-3`}
            >
              <ChevronRightIcon />
            </button>
            <p
              aria-hidden="true"
              className="pointer-events-none absolute top-3 left-3 rounded-full bg-ink/80 px-2.5 py-1 text-xs font-semibold text-white tabular-nums"
            >
              {index + 1} / {media.length}
            </p>
          </>
        ) : null}
      </div>

      {media.length > 1 ? (
        <ul className="no-scrollbar -mx-1 mt-3 flex gap-2.5 overflow-x-auto px-1 py-1">
          {media.map((item, i) => (
            <li key={`${item.url}-${i}`} className="shrink-0">
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show ${item.type === 'VIDEO' ? 'video' : 'photo'} ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
                className={`relative block size-16 overflow-hidden rounded-xl ring-2 ring-offset-2 ring-offset-mist transition ${
                  i === index ? 'ring-oud' : 'opacity-70 ring-transparent hover:opacity-100'
                }`}
              >
                <MediaThumb media={item} alt="" widths={[160]} sizes="64px" />
                {item.type === 'VIDEO' ? (
                  <span className="absolute inset-0 grid place-items-center bg-ink/35 text-white">
                    <PlayIcon width={16} height={16} />
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
