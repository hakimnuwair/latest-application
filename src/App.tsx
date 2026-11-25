import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { useAuthStore } from './store/auth.store';

export default function App() {
  const restore = useAuthStore((s) => s.restore);

  // On every page load, check the refresh cookie once so a signed-in owner stays signed in.
  useEffect(() => {
    void restore();
  }, [restore]);

  return <RouterProvider router={router} />;
}
