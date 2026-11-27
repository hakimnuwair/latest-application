import { forwardRef, type InputHTMLAttributes } from 'react';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  hint?: string;
}

/** An on/off switch with a label and a one-line explanation. Works with react-hook-form's register(). */
export const Toggle = forwardRef<HTMLInputElement, Props>(function Toggle(
  { label, hint, id, className = '', ...rest },
  ref,
) {
  const inputId = id ?? rest.name ?? label;
  return (
    <label
      htmlFor={inputId}
      className={`flex min-h-11 cursor-pointer items-start justify-between gap-4 rounded-lg py-1 ${className}`}
    >
      <span className="min-w-0">
        <span className="block text-base font-medium">{label}</span>
        {hint ? <span className="block text-sm text-muted">{hint}</span> : null}
      </span>
      <span className="relative mt-0.5 inline-flex h-7 w-12 shrink-0">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          role="switch"
          className="peer sr-only"
          {...rest}
        />
        <span className="absolute inset-0 rounded-full bg-line transition peer-checked:bg-oud peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-oud motion-reduce:transition-none" />
        <span className="absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow transition peer-checked:translate-x-5 motion-reduce:transition-none" />
      </span>
    </label>
  );
});
