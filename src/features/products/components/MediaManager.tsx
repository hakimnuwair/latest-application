import { useState, type DragEvent } from 'react';
import { errorMessage } from '../../../api/errors';
import type { AdminMedia } from '../../../api/products';
import { MediaThumb } from '../../../components/MediaThumb';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PlayIcon,
  TrashIcon,
  UploadIcon,
} from '../../../components/icons';
import { RetryButton, StateMessage } from '../../../components/StateMessage';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useToast } from '../../../hooks/useToast';
import { ACCEPT, checkFiles, inBatches, MAX_FILE_MB, MAX_FILES_PER_PRODUCT } from '../mediaRules';
import { useDeleteMedia, useMedia, useReorderMedia, useUploadMedia } from '../queries';

const iconButton =
  'grid size-11 place-items-center rounded-xl border border-line bg-white text-ink transition hover:bg-oud-soft disabled:cursor-not-allowed disabled:opacity-40';

/** Photos and videos of one product: add (tap or drag), reorder, delete. The first photo is the cover in the shop. */
export function MediaManager({ productId }: { productId: string }) {
  const toast = useToast();
  const media = useMedia(productId);
  const upload = useUploadMedia(productId);
  const reorder = useReorderMedia(productId);
  const remove = useDeleteMedia(productId);

  const [progress, setProgress] = useState<number | null>(null);
  const [problems, setProblems] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<AdminMedia | null>(null);
  const [dragging, setDragging] = useState(false);

  const items = media.data ?? [];
  const uploading = progress !== null;
  const cover = items.find((m) => m.type === 'IMAGE') ?? items[0];

  const handleFiles = async (picked: File[]) => {
    const { ok, problems: refused } = checkFiles(picked, items.length);
    setProblems(refused);
    setUploadError(null);
    if (ok.length === 0) return;

    const batches = inBatches(ok);
    setProgress(0);
    let sent = 0;
    try {
      for (const [index, batch] of batches.entries()) {
        await upload.mutateAsync({
          files: batch,
          onProgress: (percent) =>
            setProgress(Math.round(((index + percent / 100) / batches.length) * 100)),
        });
        sent += batch.length;
      }
      toast.success(sent === 1 ? 'File uploaded' : `${sent} files uploaded`);
    } catch (error) {
      setUploadError(
        sent > 0
          ? `${sent} uploaded, then it stopped: ${errorMessage(error)}`
          : errorMessage(error),
      );
    } finally {
      setProgress(null);
    }
  };

  const move = async (index: number, by: -1 | 1) => {
    const ids = items.map((m) => m.id);
    const target = index + by;
    const a = ids[index];
    const b = ids[target];
    if (a === undefined || b === undefined) return;
    ids[index] = b;
    ids[target] = a;
    try {
      await reorder.mutateAsync(ids);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    if (!uploading) void handleFiles(Array.from(event.dataTransfer.files));
  };

  const full = items.length >= MAX_FILES_PER_PRODUCT;

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl">Photos and videos</h2>
        <p className="text-sm text-muted tabular-nums">
          {items.length} of {MAX_FILES_PER_PRODUCT}
        </p>
      </div>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex min-h-32 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-oud ${
          dragging ? 'border-oud bg-oud-soft' : 'border-line bg-white hover:bg-oud-soft/60'
        } ${uploading || full ? 'pointer-events-none opacity-60' : ''}`}
      >
        <UploadIcon width={28} height={28} className="text-oud" />
        <span className="font-semibold">
          {full ? 'This product has the most files allowed' : 'Add photos or videos'}
        </span>
        <span className="text-sm text-muted">
          JPG, PNG, WebP, AVIF, MP4, WebM or MOV. Up to {MAX_FILE_MB} MB each.
        </span>
        <input
          type="file"
          multiple
          accept={ACCEPT}
          disabled={uploading || full}
          className="sr-only"
          onChange={(e) => {
            const picked = Array.from(e.target.files ?? []);
            e.target.value = '';
            void handleFiles(picked);
          }}
        />
      </label>

      {uploading ? (
        <div>
          <div
            role="progressbar"
            aria-label="Upload progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className="h-2 overflow-hidden rounded-full bg-plinth"
          >
            <div className="h-full bg-oud transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1.5 text-sm text-muted">
            Uploading… {progress}%. Please keep this page open.
          </p>
        </div>
      ) : null}

      {problems.length > 0 ? (
        <ul
          role="alert"
          className="space-y-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
        >
          {problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      ) : null}
      {uploadError ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {uploadError}
        </p>
      ) : null}

      {media.isPending ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      ) : media.isError ? (
        <StateMessage
          title="Couldn't load the files"
          message={errorMessage(media.error)}
          action={<RetryButton onClick={() => void media.refetch()} />}
        />
      ) : items.length === 0 ? (
        <p className="text-sm text-muted">
          No photos or videos yet. The shop shows a plain placeholder until you add one.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item, index) => (
            <li key={item.id} className="space-y-2">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-plinth">
                <MediaThumb
                  media={item}
                  alt={`${item.type === 'VIDEO' ? 'Video' : 'Photo'} ${index + 1}`}
                  widths={[240, 480]}
                  sizes="(min-width: 1024px) 200px, 45vw"
                />
                {item.id === cover?.id ? (
                  <span className="absolute top-2 left-2 rounded-full bg-ink/85 px-2.5 py-1 text-xs font-semibold text-white">
                    Cover
                  </span>
                ) : null}
                {item.type === 'VIDEO' ? (
                  <span className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold">
                    <PlayIcon width={10} height={10} />
                    Video
                  </span>
                ) : null}
              </div>
              <div className="flex justify-between gap-1">
                <button
                  type="button"
                  className={iconButton}
                  disabled={index === 0 || reorder.isPending}
                  onClick={() => void move(index, -1)}
                  aria-label={`Move ${item.type === 'VIDEO' ? 'video' : 'photo'} ${index + 1} earlier`}
                >
                  <ArrowLeftIcon />
                </button>
                <button
                  type="button"
                  className={iconButton}
                  disabled={index === items.length - 1 || reorder.isPending}
                  onClick={() => void move(index, 1)}
                  aria-label={`Move ${item.type === 'VIDEO' ? 'video' : 'photo'} ${index + 1} later`}
                >
                  <ArrowRightIcon />
                </button>
                <button
                  type="button"
                  className={`${iconButton} text-red-700`}
                  onClick={() => setDeleting(item)}
                  aria-label={`Delete ${item.type === 'VIDEO' ? 'video' : 'photo'} ${index + 1}`}
                >
                  <TrashIcon />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={deleting !== null}
        title={deleting?.type === 'VIDEO' ? 'Delete video' : 'Delete photo'}
        message="This removes the file from the shop for good."
        confirmLabel={deleting?.type === 'VIDEO' ? 'Delete video' : 'Delete photo'}
        danger
        onConfirm={async () => {
          if (!deleting) return;
          await remove.mutateAsync(deleting.id);
          toast.success('File deleted');
        }}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
