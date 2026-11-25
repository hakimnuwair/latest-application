# Shop frontend

React + Vite + TypeScript + Tailwind. Talks to the backend in `../latest-apis`.

```
npm install
copy .env.example .env      (PowerShell; set VITE_API_URL if the API is not on port 5000)
npm run dev                 (opens http://localhost:5173)
```

Backend `.env` must have `CORS_ORIGIN=http://localhost:5173`.

- Public catalog: `/` (search, categories) and `/products/<slug>`.
- Owner login: type `/admin/login` yourself. There is no link to it on the public pages, and `/admin` shows "Page not found" to anyone who is not signed in.
- `.env`: `VITE_API_URL` (API address) and `VITE_SHOP_NAME` (name shown in the header and tab title).

Scripts: `dev`, `build`, `preview`, `typecheck`, `lint`, `format`, `format:check`.
