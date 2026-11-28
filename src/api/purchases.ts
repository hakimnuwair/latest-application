import { api } from './client';
import { getList, getOne, type Paged } from './helpers';
import type { EntryMode } from './parties';
import type { ApiSuccess } from './types';

/** Fields every purchase has. Money is in paise and always comes from the server. */
interface PurchaseBase {
  id: string;
  supplier: { id: string; name: string } | null;
  totalAmount: number;
  /** Paid at the time of the purchase. */
  amountPaid: number;
  /** Total minus paid at the time of the purchase. Later payments reduce what you owe the supplier, not this. */
  outstanding: number;
  mode: EntryMode;
  purchasedAt: string;
}

export interface PurchaseListItem extends PurchaseBase {
  itemCount: number;
}

export interface PurchaseLine {
  id: string;
  productId: string;
  productName: string;
  qty: number;
  /** What one piece cost, in paise. */
  unitCost: number;
  lineTotal: number;
}

export interface PurchaseDetail extends PurchaseBase {
  items: PurchaseLine[];
}

export interface NewPurchase {
  supplierId?: string;
  items: { productId: string; qty: number; unitCost: number }[];
  mode: EntryMode;
  /** Left out means: paid in full (cash, online) or nothing (credit). */
  amountPaid?: number;
  purchasedAt: string;
}

export interface PurchaseListParams {
  page: number;
  limit: number;
  supplierId?: string | undefined;
  unpaid?: boolean | undefined;
}

export const fetchPurchases = (
  params: PurchaseListParams,
  signal?: AbortSignal,
): Promise<Paged<PurchaseListItem>> =>
  getList<PurchaseListItem>('/purchases', { ...params }, signal);

export const fetchPurchase = (id: string, signal?: AbortSignal): Promise<PurchaseDetail> =>
  getOne<PurchaseDetail>(`/purchases/${id}`, signal);

export const createPurchase = async (input: NewPurchase): Promise<PurchaseDetail> =>
  (await api.post<ApiSuccess<PurchaseDetail>>('/purchases', input)).data.data;
