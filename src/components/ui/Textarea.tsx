import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { Field } from './Field';
import { controlClass, describedBy } from './fieldStyles';

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
}

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea(
  { label, error, hint, id, className = '', rows = 4, ...rest },
  ref,
) {
  const areaId = id ?? rest.name ?? label;
  return (
    <Field htmlFor={areaId} label={label} hint={hint} error={error}>
      <textarea
        ref={ref}
        id={areaId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(areaId, hint, error)}
        className={controlClass(Boolean(error), `py-2 ${className}`)}
        {...rest}
      />
    </Field>
  );
});
