import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPurchase,
  fetchPurchase,
  fetchPurchases,
  type NewPurchase,
  type PurchaseListParams,
} from '../../api/purchases';
import { invalidatePurchases, keys } from '../../api/queryKeys';

export const PURCHASES_PAGE_SIZE = 20;

export const usePurchases = (params: PurchaseListParams) =>
  useQuery({
    queryKey: [...keys.purchases, 'list', params],
    queryFn: ({ signal }) => fetchPurchases(params, signal),
    placeholderData: keepPreviousData,
  });

export const usePurchase = (id: string) =>
  useQuery({
    queryKey: [...keys.purchases, 'one', id],
    queryFn: ({ signal }) => fetchPurchase(id, signal),
    retry: false,
  });

export const useCreatePurchase = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NewPurchase) => createPurchase(input),
    onSuccess: (purchase) => invalidatePurchases(qc, purchase.supplier?.id),
  });
};
