import { api } from './client';
import { getList, type Paged } from './helpers';
import type { ApiSuccess } from './types';

export type StockStatus = 'OUT_OF_STOCK' | 'LOW' | 'OK';
export type MoveReason = 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'RETURN';

export interface InventoryItem {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  category: { id: string; name: string };
  stockQty: number;
  lowStockAt: number;
  /** Calculated by the server: OUT_OF_STOCK at 0, LOW at or below the low-stock level. */
  status: StockStatus;
  /** Weighted average cost per piece, paise. */
  avgCost: number;
  sellingPrice: number;
  /** stockQty x avgCost, paise. */
  stockValue: number;
  isActive: boolean;
}

export interface StockMovement {
  id: string;
  productId: string;
  product: { id: string; name: string };
  /** Plus for stock in, minus for stock out. */
  qtyChange: number;
  reason: MoveReason;
  refId: string | null;
  note: string | null;
  createdAt: string;
}

export interface InventoryParams {
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
  lowStock?: string;
}

export interface MovementParams {
  page: number;
  limit: number;
  productId?: string;
  reason?: string;
  from?: string;
  to?: string;
}

export const fetchInventory = (
  params: InventoryParams,
  signal?: AbortSignal,
): Promise<Paged<InventoryItem>> => getList<InventoryItem>('/inventory', { ...params }, signal);

export const fetchMovements = (
  params: MovementParams,
  signal?: AbortSignal,
): Promise<Paged<StockMovement>> =>
  getList<StockMovement>('/inventory/movements', { ...params }, signal);

export const adjustStock = async (input: {
  productId: string;
  qtyChange: number;
  reason: string;
}) =>
  (await api.post<ApiSuccess<{ movement: StockMovement }>>('/inventory/adjust', input)).data.data;
