import { api } from './client';
import type { ApiSuccess, PageMeta } from './types';

export type MediaType = 'IMAGE' | 'VIDEO';

export interface PublicMedia {
  url: string;
  type: MediaType;
}

/**
 * What the public API returns. `price` (paise) and `quantity` are ABSENT when the owner hides them,
 * so always check for undefined and never show a default such as 0.
 */
export interface PublicProduct {
  name: string;
  slug: string;
  description: string | null;
  category: { id: string; name: string };
  media: PublicMedia[];
  inStock: boolean;
  price?: number;
  quantity?: number;
}

export interface PublicCategory {
  id: string;
  name: string;
  productCount: number;
}

export interface ProductListParams {
  page: number;
  limit: number;
  search?: string | undefined;
  categoryId?: string | undefined;
}

export const fetchPublicProducts = async (
  params: ProductListParams,
  signal?: AbortSignal,
): Promise<{ items: PublicProduct[]; meta: PageMeta }> => {
  const res = await api.get<ApiSuccess<PublicProduct[]>>('/public/products', {
    params: {
      page: params.page,
      limit: params.limit,
      ...(params.search ? { search: params.search } : {}),
      ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    },
    ...(signal ? { signal } : {}),
  });
  const meta = res.data.meta;
  if (!meta) throw new Error('The server answered without paging details');
  return { items: res.data.data, meta };
};

export const fetchPublicProduct = async (
  slug: string,
  signal?: AbortSignal,
): Promise<PublicProduct> => {
  const res = await api.get<ApiSuccess<PublicProduct>>(
    `/public/products/${encodeURIComponent(slug)}`,
    signal ? { signal } : {},
  );
  return res.data.data;
};

export const fetchPublicCategories = async (signal?: AbortSignal): Promise<PublicCategory[]> => {
  const res = await api.get<ApiSuccess<PublicCategory[]>>(
    '/public/categories',
    signal ? { signal } : {},
  );
  return res.data.data;
};
