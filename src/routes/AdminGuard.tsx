import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { FullScreenSpinner } from '../components/Spinner';
import { useAuth } from '../hooks/useAuth';

/**
 * Wraps every /admin page. While the app checks the refresh cookie it shows a spinner (so a page
 * refresh does not flash the login page); signed-out users are sent to the login page and brought
 * back to the page they wanted afterwards.
 * This only controls what is SHOWN. The real protection is the API, which checks the token on every request.
 */
export function AdminGuard() {
  const { status, isAdmin } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullScreenSpinner />;
  if (!isAdmin) {
    return (
      <Navigate to="/admin/login" replace state={{ from: location.pathname + location.search }} />
    );
  }
  return <Outlet />;
}
