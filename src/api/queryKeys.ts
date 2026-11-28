import type { QueryClient } from '@tanstack/react-query';

/**
 * Every query key in one place: ['admin', area, ...]. Later parts add their areas here.
 * After a change, call the matching invalidate function so every screen that shows that data refreshes.
 */
export const keys = {
  categories: ['admin', 'categories'] as const,
  products: ['admin', 'products'] as const,
  media: (productId: string) => ['admin', 'media', productId] as const,
  inventory: ['admin', 'inventory'] as const,
  movements: ['admin', 'movements'] as const,
  customers: ['admin', 'customers'] as const,
  suppliers: ['admin', 'suppliers'] as const,
  /** One customer's or supplier's ledger: ['admin', 'ledger', kind, id, page]. */
  ledger: (kind: 'customer' | 'supplier', id: string) => ['admin', 'ledger', kind, id] as const,
  /** Reports and the dashboard (built in 12c-3). Changes to money invalidate them already. */
  reports: ['admin', 'reports'] as const,
  /** The public shop pages (catalog, product page, categories). */
  public: ['public'] as const,
};

/** A category was added, renamed, deleted or restored. */
export const invalidateCategories = (qc: QueryClient) =>
  Promise.all([
    qc.invalidateQueries({ queryKey: keys.categories }),
    qc.invalidateQueries({ queryKey: keys.products }),
    qc.invalidateQueries({ queryKey: keys.public }),
  ]);

/** A product or its photos changed. */
export const invalidateProducts = (qc: QueryClient) =>
  Promise.all([
    qc.invalidateQueries({ queryKey: keys.products }),
    qc.invalidateQueries({ queryKey: keys.inventory }),
    qc.invalidateQueries({ queryKey: keys.categories }),
    qc.invalidateQueries({ queryKey: ['admin', 'media'] }),
    qc.invalidateQueries({ queryKey: keys.public }),
  ]);

/** Stock changed (adjustment now; purchases and sales in later parts). */
export const invalidateStock = (qc: QueryClient) =>
  Promise.all([
    qc.invalidateQueries({ queryKey: keys.inventory }),
    qc.invalidateQueries({ queryKey: keys.movements }),
    qc.invalidateQueries({ queryKey: keys.products }),
    qc.invalidateQueries({ queryKey: keys.public }),
  ]);

/** A customer or supplier was added, edited or deleted, or a payment changed what they owe. */
export const invalidateParties = (qc: QueryClient, kind?: 'customer' | 'supplier') =>
  Promise.all([
    ...(kind !== 'supplier' ? [qc.invalidateQueries({ queryKey: keys.customers })] : []),
    ...(kind !== 'customer' ? [qc.invalidateQueries({ queryKey: keys.suppliers })] : []),
  ]);

/**
 * A payment was recorded, edited or deleted: the party's balance, its ledger, and the reports and dashboard
 * (money in hand) all change.
 */
export const invalidateLedger = (qc: QueryClient, kind: 'customer' | 'supplier', id: string) =>
  Promise.all([
    qc.invalidateQueries({ queryKey: keys.ledger(kind, id) }),
    invalidateParties(qc, kind),
    qc.invalidateQueries({ queryKey: keys.reports }),
  ]);
