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
