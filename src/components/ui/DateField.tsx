import { forwardRef, type InputHTMLAttributes } from 'react';
import { nowForInput, todayYmd } from '../../utils/dates';
import { Field } from './Field';
import { controlClass, describedBy } from './fieldStyles';

interface BaseProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'max'> {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
}

/** A calendar day (for filters). Cannot pick a day after today in India time. Value is "YYYY-MM-DD". */
export const DateField = forwardRef<HTMLInputElement, BaseProps>(function DateField(
  { label, error, hint, id, className = '', ...rest },
  ref,
) {
  const inputId = id ?? rest.name ?? label;
  return (
    <Field htmlFor={inputId} label={label} hint={hint} error={error}>
      <input
        ref={ref}
        id={inputId}
        type="date"
        max={todayYmd()}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(inputId, hint, error)}
        className={controlClass(Boolean(error), className)}
        {...rest}
      />
    </Field>
  );
});

/**
 * Date and time of an entry (sale, payment, expense...). Shown and typed as India time, never in the future.
 * Value is "YYYY-MM-DDTHH:mm"; convert with inputToIso() from utils/dates when saving.
 */
export const DateTimeField = forwardRef<HTMLInputElement, BaseProps>(function DateTimeField(
  { label, error, hint, id, className = '', ...rest },
  ref,
) {
  const inputId = id ?? rest.name ?? label;
  return (
    <Field htmlFor={inputId} label={label} hint={hint ?? 'India time'} error={error}>
      <input
        ref={ref}
        id={inputId}
        type="datetime-local"
        max={nowForInput()}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(inputId, hint ?? 'India time', error)}
        className={controlClass(Boolean(error), className)}
        {...rest}
      />
    </Field>
  );
});
