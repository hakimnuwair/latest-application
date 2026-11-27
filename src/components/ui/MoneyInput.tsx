import { forwardRef, type InputHTMLAttributes } from 'react';
import { Field } from './Field';
import { controlClass, describedBy } from './fieldStyles';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'inputMode'> {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
}

/**
 * Rupees typed as text ("1250" or "1250.50"), with a ₹ sign and the number keypad on phones.
 * The form keeps the text; convert with rupeesToPaise() when saving. Validate with moneyText() from utils/money.
 */
export const MoneyInput = forwardRef<HTMLInputElement, Props>(function MoneyInput(
  { label, error, hint, id, className = '', ...rest },
  ref,
) {
  const inputId = id ?? rest.name ?? label;
  return (
    <Field htmlFor={inputId} label={label} hint={hint} error={error}>
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
        >
          ₹
        </span>
        <input
          ref={ref}
          id={inputId}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, hint, error)}
          className={controlClass(Boolean(error), `pl-8 tabular-nums ${className}`)}
          {...rest}
        />
      </div>
    </Field>
  );
});
