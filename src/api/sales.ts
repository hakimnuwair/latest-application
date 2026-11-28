import { api } from './client';
import { getList, getOne, type Paged } from './helpers';
import type { EntryMode } from './parties';
import type { ApiSuccess } from './types';

/** Fields every sale has. Money is in paise and always comes from the server. */
interface SaleBase {
  id: string;
  customer: { id: string; name: string } | null;
  totalAmount: number;
  /** Paid at the time of the sale. */
  amountPaid: number;
  /** Total minus paid at the time of the sale. Later payments reduce the customer's balance, not this. */
  outstanding: number;
  mode: EntryMode;
  soldAt: string;
}

export interface SaleListItem extends SaleBase {
  itemCount: number;
}

export interface SaleLine {
  id: string;
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
  /** Average cost per piece when it was sold. Never changes later. */
  unitCost: number;
  lineTotal: number;
}

export interface SaleDetail extends SaleBase {
  items: SaleLine[];
}

export interface NewSale {
  customerId?: string;
  items: { productId: string; qty: number; unitPrice: number }[];
  mode: EntryMode;
  /** Left out means: paid in full (cash, online) or nothing (credit). */
  amountPaid?: number;
  soldAt: string;
}

export interface SaleListParams {
  page: number;
  limit: number;
  customerId?: string | undefined;
  unpaid?: boolean | undefined;
}

export const fetchSales = (
  params: SaleListParams,
  signal?: AbortSignal,
): Promise<Paged<SaleListItem>> => getList<SaleListItem>('/sales', { ...params }, signal);

export const fetchSale = (id: string, signal?: AbortSignal): Promise<SaleDetail> =>
  getOne<SaleDetail>(`/sales/${id}`, signal);

export const createSale = async (input: NewSale): Promise<SaleDetail> =>
  (await api.post<ApiSuccess<SaleDetail>>('/sales', input)).data.data;
