# Shop frontend

React + Vite + TypeScript + Tailwind. Talks to the backend in `../latest-apis`.

```
npm install
copy .env.example .env      (PowerShell; set VITE_API_URL if the API is not on port 5000)
npm run dev                 (opens http://localhost:5173)
```

Backend `.env` must have `CORS_ORIGIN=http://localhost:5173`. Owner login page: `/admin/login`.

Scripts: `dev`, `build`, `preview`, `typecheck`, `lint`, `format`, `format:check`.
