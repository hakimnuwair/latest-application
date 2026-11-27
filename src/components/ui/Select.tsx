import { forwardRef, type SelectHTMLAttributes } from 'react';
import { Field } from './Field';
import { controlClass, describedBy } from './fieldStyles';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  /** Hide the visible label (still read by screen readers). For compact filter rows. */
  hideLabel?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, error, hint, hideLabel = false, id, className = '', children, ...rest },
  ref,
) {
  const selectId = id ?? rest.name ?? label;
  const control = (
    <select
      ref={ref}
      id={selectId}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(selectId, hint, error)}
      className={controlClass(Boolean(error), className)}
      {...rest}
    >
      {children}
    </select>
  );
  if (hideLabel) {
    return (
      <div>
        <label htmlFor={selectId} className="sr-only">
          {label}
        </label>
        {control}
      </div>
    );
  }
  return (
    <Field htmlFor={selectId} label={label} hint={hint} error={error}>
      {control}
    </Field>
  );
});
