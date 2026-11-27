import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { CheckIcon, XIcon } from '../icons';
import { ToastContext, type ToastApi } from './toast-context';

interface Item {
  id: number;
  kind: 'success' | 'error';
  message: string;
}

/** Short confirmations ("Saved", "Deleted") at the bottom of the screen, above the phone navigation bar. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const seq = useRef(0);

  const push = useCallback((kind: Item['kind'], message: string) => {
    seq.current += 1;
    const id = seq.current;
    setItems((list) => [...list.slice(-2), { id, kind, message }]);
    window.setTimeout(
      () => setItems((list) => list.filter((t) => t.id !== id)),
      kind === 'error' ? 7000 : 3500,
    );
  }, []);

  const api = useMemo<ToastApi>(
    () => ({ success: (m) => push('success', m), error: (m) => push('error', m) }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-24 z-50 flex flex-col items-center gap-2 lg:inset-x-auto lg:right-6 lg:bottom-6 lg:items-end"
      >
        {items.map((item) => (
          <p
            key={item.id}
            className={`pointer-events-auto flex max-w-md items-start gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${
              item.kind === 'error' ? 'bg-red-700' : 'bg-ink'
            }`}
          >
            {item.kind === 'error' ? (
              <XIcon width={18} height={18} />
            ) : (
              <CheckIcon width={18} height={18} />
            )}
            <span>{item.message}</span>
          </p>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
