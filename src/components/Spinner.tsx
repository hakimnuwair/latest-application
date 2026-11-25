export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center gap-3 p-8">
      <span className="size-5 animate-spin rounded-full border-2 border-line border-t-oud" />
      <span className="text-sm text-muted">{label}…</span>
    </div>
  );
}

export function FullScreenSpinner() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <Spinner />
    </div>
  );
}
