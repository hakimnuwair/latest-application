import type { ReactNode } from 'react';
import { errorClass, hintClass, labelClass } from './fieldStyles';

interface Props {
  /** Must match the `id` of the control inside. */
  htmlFor: string;
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  children: ReactNode;
}

/** Label, control, hint and error message, wired together for screen readers. Used by every field in the kit. */
export function Field({ htmlFor, label, hint, error, children }: Props) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${htmlFor}-hint`} className={hintClass}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className={errorClass}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
