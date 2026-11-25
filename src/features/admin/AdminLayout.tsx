import { Outlet } from 'react-router-dom';
import { Button } from '../../components/Button';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

/** Mobile-first shell: a slim top bar and a single column. Navigation is added with the first admin screens. */
export function AdminLayout() {
  const { user, logout } = useAuth();
  useDocumentTitle('Admin');

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2">
          <div className="min-w-0">
            <p className="truncate font-semibold">Admin</p>
            <p className="truncate text-xs text-muted">{user?.email}</p>
          </div>
          <Button variant="secondary" onClick={() => void logout()}>
            Log out
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-5">
        <Outlet />
      </main>
    </div>
  );
}
