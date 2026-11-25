import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin } from 'vite';

/** Puts the shop name (VITE_SHOP_NAME) into index.html, with the same default as src/utils/env.ts. */
const shopNameInHtml = (name: string): Plugin => ({
  name: 'shop-name-in-html',
  transformIndexHtml: (html) => html.replaceAll('%SHOP_NAME%', name.replace(/[<>&"]/g, '')),
});

// The port is fixed because the backend only accepts requests from CORS_ORIGIN=http://localhost:5173.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_');
  const shopName = (env.VITE_SHOP_NAME ?? '').trim() || '2. LATEST COLLECTIONS';
  return {
    plugins: [react(), tailwindcss(), shopNameInHtml(shopName)],
    server: { port: 5173, strictPort: true },
  };
});
