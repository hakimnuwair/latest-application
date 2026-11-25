import { Link } from 'react-router-dom';

/** Placeholder public page. The real product grid is built in Step 12b. */
export function HomePage() {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="space-y-3 text-center">
        <h1 className="text-2xl font-semibold">Our shop</h1>
        <p className="text-slate-600">The product catalog is coming soon.</p>
        <Link to="/admin" className="inline-block min-h-11 py-2 text-sm text-slate-500 underline">
          Owner login
        </Link>
      </div>
    </main>
  );
}
