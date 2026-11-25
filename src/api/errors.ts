import { isAxiosError } from 'axios';
import type { ApiFailure } from './types';

/** Turns any error into a message that is safe and friendly to show. */
export const errorMessage = (error: unknown): string => {
  if (isAxiosError<ApiFailure>(error)) {
    if (!error.response) return 'Cannot reach the server. Check your internet connection.';
    if (error.response.status === 429)
      return 'Too many attempts. Please wait a few minutes and try again.';
    const body = error.response.data;
    if (body && typeof body.message === 'string' && body.message) return body.message;
    if (error.response.status >= 500) return 'Something went wrong on the server. Try again.';
  }
  return 'Something went wrong. Try again.';
};
