import { useEffect } from 'react';

/** Asks search engines not to list this page (owner pages). robots.txt also blocks /admin. */
export function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.append(meta);
    return () => meta.remove();
  }, []);
}
