import { useAuthStore } from '../store/auth.store';

/** The one place components read auth state from. */
export const useAuth = () => {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  return {
    status,
    user,
    isAuthenticated: status === 'authenticated',
    isAdmin: status === 'authenticated' && user?.role === 'ADMIN',
    login,
    logout,
  };
};
