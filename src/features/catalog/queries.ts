import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { isNotFound } from '../../api/errors';
import {
  fetchPublicCategories,
  fetchPublicProduct,
  fetchPublicProducts,
  type ProductListParams,
} from '../../api/public';

const MINUTE = 60_000;

export const usePublicProducts = (params: ProductListParams) =>
  useQuery({
    queryKey: ['public', 'products', params],
    queryFn: ({ signal }) => fetchPublicProducts(params, signal),
    placeholderData: keepPreviousData, // keep the old grid on screen while the next page loads
    staleTime: MINUTE,
  });

export const usePublicProduct = (slug: string) =>
  useQuery({
    queryKey: ['public', 'product', slug],
    queryFn: ({ signal }) => fetchPublicProduct(slug, signal),
    staleTime: MINUTE,
    retry: (count, error) => !isNotFound(error) && count < 1,
  });

export const usePublicCategories = () =>
  useQuery({
    queryKey: ['public', 'categories'],
    queryFn: ({ signal }) => fetchPublicCategories(signal),
    staleTime: 5 * MINUTE,
  });
