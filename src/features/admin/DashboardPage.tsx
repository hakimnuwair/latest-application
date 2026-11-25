import { useEffect, useState } from 'react';
import { fetchMe } from '../../api/auth';
import { errorMessage } from '../../api/errors';
import { useAuth } from '../../hooks/useAuth';

type Check =
  { state: 'checking' } | { state: 'ok'; email: string } | { state: 'failed'; message: string };

/** Placeholder home. The "session check" proves the token and the automatic refresh work end to end. */
export function DashboardPage() {
  const { user } = useAuth();
  const [check, setCheck] = useState<Check>({ state: 'checking' });

  useEffect(() => {
    let cancelled = false;
    fetchMe()
      .then((me) => !cancelled && setCheck({ state: 'ok', email: me.email }))
      .catch(
        (error: unknown) =>
          !cancelled && setCheck({ state: 'failed', message: errorMessage(error) }),
      );
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
        <p className="text-sm text-muted">Signed in as</p>
        <p className="font-medium">{user?.email}</p>
        <p className="mt-3 text-sm text-muted">Server session check</p>
        <p className="text-sm" role="status">
          {check.state === 'checking' && 'Checking…'}
          {check.state === 'ok' && `Connected as ${check.email}`}
          {check.state === 'failed' && <span className="text-red-600">{check.message}</span>}
        </p>
      </div>
      <p className="text-sm text-muted">
        Products, sales, purchases, expenses and reports screens arrive in the next steps.
      </p>
    </section>
  );
}
