import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../../../components/Logo';
import { SHOP_NAME } from '../../../utils/env';

/** Header and footer shared by every public page. */
export function CatalogShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center px-4 pt-5 pb-2 sm:px-6">
        <Link
          to="/"
          aria-label={`${SHOP_NAME}, home`}
          className="inline-flex min-h-11 items-center gap-2.5 font-display text-2xl leading-none tracking-wide sm:text-3xl"
        >
          <Logo />
          <span>{SHOP_NAME}</span>
        </Link>
      </header>
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 sm:px-6">{children}</div>
      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-6 px-4 py-5 text-sm text-muted sm:px-6">
          <p>
            © {new Date().getFullYear()} {SHOP_NAME}
          </p>
        </div>
      </footer>
    </div>
  );
}
