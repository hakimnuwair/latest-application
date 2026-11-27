import { api } from './client';
import type { ApiSuccess } from './types';

export interface Category {
  id: string;
  name: string;
  /** Active products in this category. */
  productCount: number;
  deletedAt: string | null;
}

export const fetchCategories = async (
  deleted: boolean,
  signal?: AbortSignal,
): Promise<Category[]> => {
  const res = await api.get<ApiSuccess<Category[]>>('/categories', {
    params: deleted ? { deleted: true } : {},
    ...(signal ? { signal } : {}),
  });
  return res.data.data;
};

export const createCategory = async (name: string): Promise<Category> =>
  (await api.post<ApiSuccess<Category>>('/categories', { name })).data.data;

export const renameCategory = async (id: string, name: string): Promise<Category> =>
  (await api.patch<ApiSuccess<Category>>(`/categories/${id}`, { name })).data.data;

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/categories/${id}`);
};

export const restoreCategory = async (id: string): Promise<Category> =>
  (await api.post<ApiSuccess<Category>>(`/categories/${id}/restore`)).data.data;
