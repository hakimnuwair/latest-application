import { api } from './client';
import { getList, getOne, type Paged } from './helpers';
import type { MediaType } from './public';
import type { ApiSuccess } from './types';

/** A product as the owner sees it. Money is in paise. Stock and average cost are read-only here. */
export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  categoryId: string;
  category: { id: string; name: string };
  sellingPrice: number;
  avgCost: number;
  stockQty: number;
  lowStockAt: number;
  showPrice: boolean;
  showQuantity: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListParams {
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
  isActive?: string;
}

/** The fields the owner can change. */
export interface ProductInput {
  name: string;
  categoryId: string;
  sellingPrice: number;
  sku: string | null;
  description: string | null;
  lowStockAt: number;
  showPrice: boolean;
  showQuantity: boolean;
  isActive: boolean;
}

export const fetchProducts = (
  params: ProductListParams,
  signal?: AbortSignal,
): Promise<Paged<AdminProduct>> => getList<AdminProduct>('/products', { ...params }, signal);

export const fetchProduct = (id: string, signal?: AbortSignal): Promise<AdminProduct> =>
  getOne<AdminProduct>(`/products/${id}`, signal);

export const createProduct = async (input: ProductInput): Promise<AdminProduct> =>
  (await api.post<ApiSuccess<AdminProduct>>('/products', input)).data.data;

export const updateProduct = async (
  id: string,
  changes: Partial<ProductInput>,
): Promise<AdminProduct> =>
  (await api.patch<ApiSuccess<AdminProduct>>(`/products/${id}`, changes)).data.data;

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};

// ---- photos and videos ----------------------------------------------------------------------

export interface AdminMedia {
  id: string;
  productId: string;
  url: string;
  publicId: string;
  type: MediaType;
  sortOrder: number;
}

export const fetchMedia = (productId: string, signal?: AbortSignal): Promise<AdminMedia[]> =>
  getOne<AdminMedia[]>(`/products/${productId}/media`, signal);

/** Uploads up to 5 files in one request. `onProgress` gets 0 to 100 for this request. */
export const uploadMedia = async (
  productId: string,
  files: File[],
  onProgress?: (percent: number) => void,
): Promise<AdminMedia[]> => {
  const form = new FormData();
  for (const file of files) form.append('files', file);
  const res = await api.post<ApiSuccess<AdminMedia[]>>(`/products/${productId}/media`, form, {
    timeout: 10 * 60_000, // videos can be large on a slow connection
    onUploadProgress: (event) => {
      if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });
  return res.data.data;
};

export const reorderMedia = async (productId: string, mediaIds: string[]): Promise<AdminMedia[]> =>
  (await api.put<ApiSuccess<AdminMedia[]>>(`/products/${productId}/media/order`, { mediaIds })).data
    .data;

export const deleteMedia = async (productId: string, mediaId: string): Promise<void> => {
  await api.delete(`/products/${productId}/media/${mediaId}`);
};
