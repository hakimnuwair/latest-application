import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { Button } from '../../components/Button';
import { ExternalIcon, LogoutIcon, MoreIcon } from '../../components/icons';
import { Modal } from '../../components/ui/Modal';
import { ToastProvider } from '../../components/ui/Toast';
import { useAuth } from '../../hooks/useAuth';
import { SHOP_NAME } from '../../utils/env';
import { adminNav, NAV_SECTIONS, type NavItem } from './nav';

const linkBase =
  'flex items-center gap-3 rounded-xl px-3 min-h-11 text-base font-medium transition';

function SideLink({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      end={item.end ?? false}
      className={({ isActive }) =>
        `${linkBase} ${isActive ? 'bg-oud text-white' : 'text-ink hover:bg-oud-soft'}`
      }
    >
      <item.icon />
      {item.label}
    </NavLink>
  );
}

/**
 * The frame of every admin page. Phone: slim top bar and a bottom bar (4 items and "More"), so everything is
 * within thumb reach. From 1024px: a left sidebar. Pages add themselves in `nav.ts`.
 */
export function AdminLayout() {
  const { user, logout } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  const mobileItems = adminNav.filter((item) => item.mobile).slice(0, 4);
  const moreItems = adminNav.filter((item) => !mobileItems.includes(item));

  return (
    <ToastProvider>
      <div className="min-h-dvh lg:pl-64">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-line bg-white lg:flex">
          <Link
            to="/admin"
            className="flex min-h-16 items-center gap-2.5 px-5 pt-4 pb-2 font-display text-xl leading-tight"
          >
            <Logo size={32} />
            <span>{SHOP_NAME}</span>
          </Link>
          <nav aria-label="Admin" className="flex-1 space-y-4 overflow-y-auto px-3 py-3">
            {NAV_SECTIONS.map((section) => {
              const items = adminNav.filter((item) => item.section === section);
              if (items.length === 0) return null;
              return (
                <div key={section} className="space-y-1">
                  {section !== 'Home' ? (
                    <p className="px-3 pb-1 text-sm text-muted">{section}</p>
                  ) : null}
                  {items.map((item) => (
                    <SideLink key={item.to} item={item} />
                  ))}
                </div>
              );
            })}
          </nav>
          <div className="space-y-1 border-t border-line p-3">
            <p className="truncate px-3 pb-1 text-sm text-muted">{user?.email}</p>
            <Link to="/" className={`${linkBase} text-ink hover:bg-oud-soft`}>
              <ExternalIcon />
              View shop
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className={`${linkBase} w-full text-ink hover:bg-oud-soft`}
            >
              <LogoutIcon />
              Log out
            </button>
          </div>
        </aside>

        {/* Phone top bar */}
        <header className="sticky top-0 z-20 flex min-h-14 items-center gap-2.5 border-b border-line bg-white/95 px-4 backdrop-blur lg:hidden">
          <Logo size={30} />
          <p className="truncate font-display text-xl leading-none">{SHOP_NAME}</p>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 pt-5 pb-28 sm:px-6 lg:px-8 lg:pt-8 lg:pb-12">
          <Outlet />
        </main>

        {/* Phone bottom bar */}
        <nav
          aria-label="Admin"
          className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        >
          <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2">
            {mobileItems.map((item) => (
              <li key={item.to} className="flex-1">
                <NavLink
                  to={item.to}
                  end={item.end ?? false}
                  className={({ isActive }) =>
                    `flex min-h-16 flex-col items-center justify-center gap-0.5 text-xs font-semibold ${
                      isActive ? 'text-oud' : 'text-muted'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`rounded-full px-4 py-1 transition ${isActive ? 'bg-oud-soft' : ''}`}
                      >
                        <item.icon />
                      </span>
                      {item.label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
            <li className="flex-1">
              <button
                type="button"
                onClick={() => setMoreOpen(true)}
                className="flex min-h-16 w-full flex-col items-center justify-center gap-0.5 text-xs font-semibold text-muted"
              >
                <span className="px-4 py-1">
                  <MoreIcon />
                </span>
                More
              </button>
            </li>
          </ul>
        </nav>

        <Modal open={moreOpen} title="More" onClose={() => setMoreOpen(false)}>
          <div className="space-y-1">
            {moreItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMoreOpen(false)}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? 'bg-oud text-white' : 'text-ink hover:bg-oud-soft'}`
                }
              >
                <item.icon />
                {item.label}
              </NavLink>
            ))}
            <Link to="/" className={`${linkBase} text-ink hover:bg-oud-soft`}>
              <ExternalIcon />
              View shop
            </Link>
            <div className="mt-3 space-y-3 border-t border-line pt-3">
              <p className="truncate text-sm text-muted">Signed in as {user?.email}</p>
              <Button variant="secondary" className="w-full" onClick={() => void logout()}>
                Log out
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ToastProvider>
  );
}
