import { create } from 'zustand';
import { loginRequest, logoutRequest, restoreSession } from '../api/auth';
import { setAccessToken, setSessionExpiredHandler } from '../api/session';
import type { AuthUser } from '../api/types';

/** loading = checking the refresh cookie on page load; do not redirect to login until this is settled. */
export type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  /** True once the owner has been signed in during this visit (used to tell "session ended" from "stranger"). */
  wasSignedIn: boolean;
  /** Runs once when the app starts. */
  restore: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  user: null,
  wasSignedIn: false,

  restore: async () => {
    try {
      const session = await restoreSession();
      set({ status: 'authenticated', user: session.user, wasSignedIn: true });
    } catch {
      set({ status: 'anonymous', user: null });
    }
  },

  login: async (email, password) => {
    const session = await loginRequest(email, password);
    set({ status: 'authenticated', user: session.user, wasSignedIn: true });
  },

  logout: async () => {
    try {
      await logoutRequest();
    } finally {
      set({ status: 'anonymous', user: null });
    }
  },
}));

// When a refresh fails in the middle of using the app, drop to the login page instead of showing errors.
setSessionExpiredHandler(() => {
  setAccessToken(null);
  useAuthStore.setState({ status: 'anonymous', user: null });
});
