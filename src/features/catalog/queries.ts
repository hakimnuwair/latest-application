import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  fetchPublicCategories,
  fetchPublicProduct,
  fetchPublicProducts,
  type ProductListParams,
} from '../../api/public';

const MINUTE = 60_000;

/** A missing product is final: do not retry a 404. Anything else gets one more try. */
export const isNotFound = (error: unknown): boolean =>
  isAxiosError(error) && error.response?.status === 404;

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
