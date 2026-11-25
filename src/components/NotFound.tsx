import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <Link to="/" className="inline-block min-h-11 py-2 underline">
          Go to the home page
        </Link>
      </div>
    </main>
  );
}
