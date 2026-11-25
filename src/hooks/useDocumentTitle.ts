import { useEffect } from 'react';
import { SHOP_NAME } from '../utils/env';

/** Sets the browser tab title for a page and puts the shop name back when the page closes. */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${SHOP_NAME}` : SHOP_NAME;
    return () => {
      document.title = SHOP_NAME;
    };
  }, [title]);
}
