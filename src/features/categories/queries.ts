import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  renameCategory,
  restoreCategory,
} from '../../api/categories';
import { invalidateCategories, keys } from '../../api/queryKeys';

export const useCategories = (deleted = false) =>
  useQuery({
    queryKey: [...keys.categories, { deleted }],
    queryFn: ({ signal }) => fetchCategories(deleted, signal),
    staleTime: 30_000,
  });

export const useSaveCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id?: string | undefined; name: string }) =>
      input.id ? renameCategory(input.id, input.name) : createCategory(input.name),
    onSuccess: () => invalidateCategories(qc),
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: deleteCategory, onSuccess: () => invalidateCategories(qc) });
};

export const useRestoreCategory = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: restoreCategory, onSuccess: () => invalidateCategories(qc) });
};
