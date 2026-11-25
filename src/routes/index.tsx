import { createBrowserRouter } from 'react-router-dom';
import { NotFound } from '../components/NotFound';
import { AdminLayout } from '../features/admin/AdminLayout';
import { DashboardPage } from '../features/admin/DashboardPage';
import { LoginPage } from '../features/auth/LoginPage';
import { HomePage } from '../features/catalog/HomePage';
import { AdminGuard } from './AdminGuard';

export const router = createBrowserRouter([
  // Public
  { path: '/', element: <HomePage /> },
  { path: '/admin/login', element: <LoginPage /> },

  // Admin: everything below is behind the guard. New admin screens are added as children here.
  {
    path: '/admin',
    element: <AdminGuard />,
    children: [
      { element: <AdminLayout />, children: [{ index: true, element: <DashboardPage /> }] },
    ],
  },

  { path: '*', element: <NotFound /> },
]);
