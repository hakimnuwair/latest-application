import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { XIcon } from '../icons';

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Buttons row. Stays visible while the body scrolls. */
  footer?: ReactNode;
  /** false while something is saving: Esc, the backdrop and the close button do nothing. */
  dismissible?: boolean;
}

/**
 * A bottom sheet on a phone and a centered dialog from 768px up. Built on the native <dialog>, so the keyboard
 * focus stays inside, Esc closes it and the page behind cannot be tapped. Content is created only while open,
 * so a form inside always starts fresh.
 */
export function Modal({ open, title, onClose, children, footer, dismissible = true }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Rendered in the page body so a dialog opened from inside a <form> (for example "add customer" on the sale
  // screen) is never a form nested in a form.
  return createPortal(
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        if (dismissible) onClose();
      }}
      onClick={(e) => {
        if (dismissible && e.target === e.currentTarget) onClose();
      }}
      className="m-0 mt-auto max-h-none w-full max-w-none rounded-t-3xl bg-white p-0 text-ink shadow-2xl backdrop:bg-ink/50 md:m-auto md:max-w-lg md:rounded-3xl"
    >
      {open ? (
        <div className="flex max-h-[92dvh] flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
            <h2 id={titleId} className="font-display text-2xl leading-tight">
              {title}
            </h2>
            <button
              type="button"
              aria-label="Close"
              disabled={!dismissible}
              onClick={onClose}
              className="grid size-11 shrink-0 place-items-center rounded-full text-muted hover:bg-oud-soft hover:text-ink disabled:opacity-40"
            >
              <XIcon />
            </button>
          </div>
          <div className="overflow-y-auto px-5 py-4">{children}</div>
          {footer ? (
            <div className="flex flex-col-reverse gap-2 border-t border-line px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end">
              {footer}
            </div>
          ) : null}
        </div>
      ) : null}
    </dialog>,
    document.body,
  );
}
