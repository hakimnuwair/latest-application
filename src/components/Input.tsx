import { forwardRef, type InputHTMLAttributes } from 'react';
import { Field } from './ui/Field';
import { controlClass, describedBy } from './ui/fieldStyles';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
}

/** Label + input + error message wired together for screen readers. Works with react-hook-form's register(). */
export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, hint, id, className = '', ...rest },
  ref,
) {
  const inputId = id ?? rest.name ?? label;
  return (
    <Field htmlFor={inputId} label={label} hint={hint} error={error}>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(inputId, hint, error)}
        className={controlClass(Boolean(error), className)}
        {...rest}
      />
    </Field>
  );
});
