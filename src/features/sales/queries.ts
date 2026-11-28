import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSale,
  fetchSale,
  fetchSales,
  type NewSale,
  type SaleListParams,
} from '../../api/sales';
import { invalidateSales, keys } from '../../api/queryKeys';

export const SALES_PAGE_SIZE = 20;

export const useSales = (params: SaleListParams) =>
  useQuery({
    queryKey: [...keys.sales, 'list', params],
    queryFn: ({ signal }) => fetchSales(params, signal),
    placeholderData: keepPreviousData,
  });

export const useSale = (id: string) =>
  useQuery({
    queryKey: [...keys.sales, 'one', id],
    queryFn: ({ signal }) => fetchSale(id, signal),
    retry: false,
  });

export const useCreateSale = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NewSale) => createSale(input),
    onSuccess: (sale) => invalidateSales(qc, sale.customer?.id),
  });
};
