import { api, refreshSession } from './client';
import { setAccessToken } from './session';
import type { ApiSuccess, AuthSession, AuthUser } from './types';

export const loginRequest = async (email: string, password: string): Promise<AuthSession> => {
  const res = await api.post<ApiSuccess<AuthSession>>('/auth/login', { email, password });
  setAccessToken(res.data.data.accessToken);
  return res.data.data;
};

/** Called on page load: if the refresh cookie is still valid the user stays signed in. */
export const restoreSession = (): Promise<AuthSession> => refreshSession();

export const logoutRequest = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } finally {
    setAccessToken(null);
  }
};

export const fetchMe = async (): Promise<AuthUser> => {
  const res = await api.get<ApiSuccess<{ user: AuthUser }>>('/auth/me');
  return res.data.data.user;
};
