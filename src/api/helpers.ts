import { api } from './client';
import type { ApiSuccess, PageMeta } from './types';

export interface Paged<T> {
  items: T[];
  meta: PageMeta;
}

/** Removes empty values so they are not sent as "?search=&categoryId=". */
export const cleanParams = (params: Record<string, string | number | boolean | undefined | null>) =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  );

/** GET a paged list: returns the rows and the paging details. */
export const getList = async <T>(
  path: string,
  params: Record<string, string | number | boolean | undefined | null>,
  signal?: AbortSignal,
): Promise<Paged<T>> => {
  const res = await api.get<ApiSuccess<T[]>>(path, {
    params: cleanParams(params),
    ...(signal ? { signal } : {}),
  });
  if (!res.data.meta) throw new Error('The server answered without paging details');
  return { items: res.data.data, meta: res.data.meta };
};

/** GET one thing. */
export const getOne = async <T>(path: string, signal?: AbortSignal): Promise<T> => {
  const res = await api.get<ApiSuccess<T>>(path, signal ? { signal } : {});
  return res.data.data;
};
