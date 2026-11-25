import { createBrowserRouter } from 'react-router-dom';
import { NotFound } from '../components/NotFound';
import { CatalogPage } from '../features/catalog/CatalogPage';
import { ProductPage } from '../features/catalog/ProductPage';
import { AdminGuard } from './AdminGuard';

export const router = createBrowserRouter([
  // Public
  { path: '/', element: <CatalogPage /> },
  { path: '/products/:slug', element: <ProductPage /> },
  {
    path: '/admin/login',
    lazy: async () => {
      const { LoginPage } = await import('../features/auth/LoginPage');
      return { Component: LoginPage };
    },
  },

  // Admin: everything below is behind the guard. New admin screens are added as children here.
  {
    path: '/admin',
    element: <AdminGuard />,
    children: [
      {
        // Loaded only when the owner opens /admin, so shoppers never download admin code.
        lazy: async () => {
          const { AdminLayout } = await import('../features/admin/AdminLayout');
          return { Component: AdminLayout };
        },
        children: [
          {
            index: true,
            lazy: async () => {
              const { DashboardPage } = await import('../features/admin/DashboardPage');
              return { Component: DashboardPage };
            },
          },
        ],
      },
    ],
  },

  { path: '*', element: <NotFound /> },
]);
