import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { NotFound } from '../components/NotFound';
import { FullScreenSpinner } from '../components/Spinner';
import { useAuth } from '../hooks/useAuth';
import { useNoIndex } from '../hooks/useNoIndex';

/**
 * Wraps every /admin page. While the app checks the refresh cookie it shows a spinner (so a page
 * refresh does not flash the login page).
 * - Owner signed in: the page.
 * - Owner whose session just ended (expired or logged out): the login page, then back to the page they wanted.
 * - Anyone else who types /admin: the normal "Page not found" page, so the owner area is not advertised.
 *   Only someone who knows /admin/login can reach the login form.
 * This only controls what is SHOWN. The real protection is the API, which checks the token on every request.
 */
export function AdminGuard() {
  useNoIndex();
  const { status, isAdmin, wasSignedIn } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullScreenSpinner />;
  if (isAdmin) return <Outlet />;
  if (!wasSignedIn) return <NotFound />;
  return (
    <Navigate to="/admin/login" replace state={{ from: location.pathname + location.search }} />
  );
}
