/** Backend base URL, for example http://localhost:5000/api/v1 (set VITE_API_URL in .env). */
export const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1').replace(
  /\/+$/,
  '',
);

/** Shop name shown in the header, footer and page titles (set VITE_SHOP_NAME in .env). */
const DEFAULT_SHOP_NAME = '2. LATEST COLLECTIONS';
export const SHOP_NAME = (import.meta.env.VITE_SHOP_NAME ?? '').trim() || DEFAULT_SHOP_NAME;
