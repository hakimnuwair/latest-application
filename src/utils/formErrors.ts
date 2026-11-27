import { isAxiosError } from 'axios';
import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form';
import { errorMessage } from '../api/errors';
import type { ApiFailure } from '../api/types';

/**
 * Puts the server's field errors (for example "Another product already uses this SKU") next to the right field.
 * Returns the message to show above the form when nothing could be placed on a field.
 */
export function applyApiErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly FieldPath<T>[],
): string | null {
  const list = isAxiosError<ApiFailure>(error) ? (error.response?.data.errors ?? []) : [];
  let placed = 0;
  for (const item of list) {
    const field = item.field?.split('.')[0] as FieldPath<T> | undefined;
    if (field && fields.includes(field)) {
      setError(field, { message: item.message });
      placed += 1;
    }
  }
  return placed > 0 && placed === list.length ? null : errorMessage(error);
}
