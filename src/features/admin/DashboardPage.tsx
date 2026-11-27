import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../components/ui/PageHeader';
import { adminNav } from './nav';

/** Home. Quick links for now; the numbers (sales, profit, money in hand) arrive in part 12c-3. */
export function DashboardPage() {
  useDocumentTitle('Home');
  const { user } = useAuth();
  const links = adminNav.filter((item) => item.to !== '/admin');

  return (
    <section>
      <PageHeader title="Welcome" description={user?.email} />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className="flex min-h-20 items-center gap-3 rounded-2xl border border-line bg-white p-4 transition hover:border-oud/40 hover:bg-oud-soft"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-oud-soft text-oud">
                <item.icon />
              </span>
              <span className="font-semibold">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
