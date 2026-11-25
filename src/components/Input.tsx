import { forwardRef, type InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | undefined;
}

/** Label + input + error message wired together for screen readers. Works with react-hook-form's register(). */
export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, id, className = '', ...rest },
  ref,
) {
  const inputId = id ?? rest.name ?? label;
  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm font-medium text-ink/80">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`block min-h-11 w-full rounded-lg border bg-white px-3 text-base text-ink placeholder:text-muted focus:border-oud focus:outline-2 focus:outline-oud ${
          error ? 'border-red-500' : 'border-line'
        } ${className}`}
        {...rest}
      />
      {error ? (
        <p id={`${inputId}-error`} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
});
