import axios, { isAxiosError, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '../utils/env';
import { getAccessToken, notifySessionExpired, setAccessToken } from './session';
import type { ApiSuccess, AuthSession } from './types';

/** withCredentials sends the httpOnly refresh cookie to the API (the API allows it through CORS). */
export const api = axios.create({ baseURL: API_URL, withCredentials: true, timeout: 20_000 });

// These calls must never trigger a refresh (login failures are real failures; refresh must not call itself).
const NO_REFRESH_PATHS = ['/auth/login', '/auth/refresh', '/auth/logout'];

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

let refreshing: Promise<AuthSession> | null = null;

/**
 * Asks the API for a new access token using the refresh cookie. If several requests fail at once
 * (or React runs an effect twice in development) they all share ONE refresh call.
 */
export const refreshSession = (): Promise<AuthSession> => {
  refreshing ??= axios
    .post<ApiSuccess<AuthSession>>(`${API_URL}/auth/refresh`, undefined, { withCredentials: true })
    .then((res) => {
      setAccessToken(res.data.data.accessToken);
      return res.data.data;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
};

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!isAxiosError(error)) throw error;
    const failure = error as AxiosError;
    const config = failure.config as RetriableConfig | undefined;
    const path = config?.url ?? '';

    const canRefresh =
      failure.response?.status === 401 &&
      config !== undefined &&
      !config._retried &&
      !NO_REFRESH_PATHS.some((p) => path.startsWith(p));

    if (!canRefresh) throw error;

    config._retried = true; // retry the original request only once, so a real 401 cannot loop

    // If another request already refreshed the token while this one was in flight, just retry with it.
    const usedToken = String(config.headers.get('Authorization') ?? '').replace('Bearer ', '');
    const current = getAccessToken();
    if (current && current !== usedToken) {
      return api(config);
    }

    try {
      await refreshSession();
    } catch {
      setAccessToken(null);
      notifySessionExpired();
      throw error;
    }
    return api(config);
  },
);
