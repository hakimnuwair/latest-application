import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createProduct,
  deleteMedia,
  deleteProduct,
  fetchMedia,
  fetchProduct,
  fetchProducts,
  reorderMedia,
  updateProduct,
  uploadMedia,
  type ProductInput,
  type ProductListParams,
} from '../../api/products';
import { invalidateProducts, keys } from '../../api/queryKeys';

export const useProducts = (params: ProductListParams) =>
  useQuery({
    queryKey: [...keys.products, 'list', params],
    queryFn: ({ signal }) => fetchProducts(params, signal),
    placeholderData: keepPreviousData,
  });

export const useProduct = (id: string | undefined) =>
  useQuery({
    queryKey: [...keys.products, 'one', id],
    queryFn: ({ signal }) => fetchProduct(id ?? '', signal),
    enabled: Boolean(id),
  });

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) => createProduct(input),
    onSuccess: () => invalidateProducts(qc),
  });
};

export const useUpdateProduct = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (changes: Partial<ProductInput>) => updateProduct(id, changes),
    onSuccess: () => invalidateProducts(qc),
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: deleteProduct, onSuccess: () => invalidateProducts(qc) });
};

// ---- photos and videos ----

export const useMedia = (productId: string) =>
  useQuery({
    queryKey: keys.media(productId),
    queryFn: ({ signal }) => fetchMedia(productId, signal),
  });

export const useUploadMedia = (productId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { files: File[]; onProgress: (percent: number) => void }) =>
      uploadMedia(productId, input.files, input.onProgress),
    onSettled: () => invalidateProducts(qc),
  });
};

export const useReorderMedia = (productId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mediaIds: string[]) => reorderMedia(productId, mediaIds),
    onSuccess: () => invalidateProducts(qc),
  });
};

export const useDeleteMedia = (productId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mediaId: string) => deleteMedia(productId, mediaId),
    onSuccess: () => invalidateProducts(qc),
  });
};
