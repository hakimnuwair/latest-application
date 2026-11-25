/**
 * Holds the short-lived access token IN MEMORY only (never localStorage), so a script injected into the
 * page cannot read it. The long-lived refresh token lives in an httpOnly cookie the browser manages.
 * Kept separate from the store so the axios client and the store do not import each other.
 */
let accessToken: string | null = null;
let onSessionExpired: (() => void) | null = null;

export const getAccessToken = (): string | null => accessToken;
export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

/** The store registers a callback here; the client calls it when a refresh fails (user must log in again). */
export const setSessionExpiredHandler = (handler: (() => void) | null): void => {
  onSessionExpired = handler;
};
export const notifySessionExpired = (): void => {
  onSessionExpired?.();
};
