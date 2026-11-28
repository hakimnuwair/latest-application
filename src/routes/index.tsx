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
          // Step 12c-2b: sales.
          {
            path: 'sales',
            lazy: async () => {
              const { SalesPage } = await import('../features/sales/SalesPage');
              return { Component: SalesPage };
            },
          },
          {
            path: 'sales/new',
            lazy: async () => {
              const { NewSalePage } = await import('../features/sales/NewSalePage');
              return { Component: NewSalePage };
            },
          },
          {
            path: 'sales/:id',
            lazy: async () => {
              const { SaleDetailPage } = await import('../features/sales/SaleDetailPage');
              return { Component: SaleDetailPage };
            },
          },
          // Step 12c-2c: purchases.
          {
            path: 'purchases',
            lazy: async () => {
              const { PurchasesPage } = await import('../features/purchases/PurchasesPage');
              return { Component: PurchasesPage };
            },
          },
          {
            path: 'purchases/new',
            lazy: async () => {
              const { NewPurchasePage } = await import('../features/purchases/NewPurchasePage');
              return { Component: NewPurchasePage };
            },
          },
          {
            path: 'purchases/:id',
            lazy: async () => {
              const { PurchaseDetailPage } =
                await import('../features/purchases/PurchaseDetailPage');
              return { Component: PurchaseDetailPage };
            },
          },
          // Step 12c-2a: customers and suppliers, each with its ledger.
          {
            path: 'customers',
            lazy: async () => {
              const { CustomersPage } = await import('../features/customers/CustomersPage');
              return { Component: CustomersPage };
            },
          },
          {
            path: 'customers/:id',
            lazy: async () => {
              const { CustomerLedgerPage } =
                await import('../features/customers/CustomerLedgerPage');
              return { Component: CustomerLedgerPage };
            },
          },
          {
            path: 'suppliers',
            lazy: async () => {
              const { SuppliersPage } = await import('../features/suppliers/SuppliersPage');
              return { Component: SuppliersPage };
            },
          },
          {
            path: 'suppliers/:id',
            lazy: async () => {
              const { SupplierLedgerPage } =
                await import('../features/suppliers/SupplierLedgerPage');
              return { Component: SupplierLedgerPage };
            },
          },
          // Step 12c-1: stock. Later parts add their routes below, one block per screen.
          {
            path: 'categories',
            lazy: async () => {
              const { CategoriesPage } = await import('../features/categories/CategoriesPage');
              return { Component: CategoriesPage };
            },
          },
          {
            path: 'products',
            lazy: async () => {
              const { ProductsPage } = await import('../features/products/ProductsPage');
              return { Component: ProductsPage };
            },
          },
          {
            path: 'products/new',
            lazy: async () => {
              const { ProductFormPage } = await import('../features/products/ProductFormPage');
              return { Component: ProductFormPage };
            },
          },
          {
            path: 'products/:id',
            lazy: async () => {
              const { ProductFormPage } = await import('../features/products/ProductFormPage');
              return { Component: ProductFormPage };
            },
          },
          {
            path: 'inventory',
            lazy: async () => {
              const { InventoryPage } = await import('../features/inventory/InventoryPage');
              return { Component: InventoryPage };
            },
          },
        ],
      },
    ],
  },

  { path: '*', element: <NotFound /> },
]);
