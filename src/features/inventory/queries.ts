import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adjustStock,
  fetchInventory,
  fetchMovements,
  type InventoryParams,
  type MovementParams,
} from '../../api/inventory';
import { invalidateStock, keys } from '../../api/queryKeys';

export const useInventory = (params: InventoryParams) =>
  useQuery({
    queryKey: [...keys.inventory, params],
    queryFn: ({ signal }) => fetchInventory(params, signal),
    placeholderData: keepPreviousData,
  });

export const useMovements = (params: MovementParams) =>
  useQuery({
    queryKey: [...keys.movements, params],
    queryFn: ({ signal }) => fetchMovements(params, signal),
    placeholderData: keepPreviousData,
  });

export const useAdjustStock = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: adjustStock, onSuccess: () => invalidateStock(qc) });
};
