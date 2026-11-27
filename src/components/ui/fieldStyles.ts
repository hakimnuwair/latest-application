/** The one look shared by Input, Select, Textarea, MoneyInput and the date fields. */
export const labelClass = 'block text-sm font-medium text-ink/80';
export const hintClass = 'text-sm text-muted';
export const errorClass = 'text-sm text-red-600';

export const controlClass = (hasError: boolean, extra = ''): string =>
  `block min-h-11 w-full rounded-lg border bg-white px-3 text-base text-ink placeholder:text-muted focus:border-oud focus:outline-2 focus:outline-oud disabled:bg-plinth disabled:text-muted ${
    hasError ? 'border-red-500' : 'border-line'
  } ${extra}`;

/** aria-describedby value for a control inside <Field>. */
export const describedBy = (id: string, hint?: string, error?: string): string | undefined =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;
