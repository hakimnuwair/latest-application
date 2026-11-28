import { api } from './client';
import { getList, getOne, type Paged } from './helpers';
import type { ApiSuccess, PageMeta } from './types';

/** A customer (they owe you) or a supplier (you owe them). The API gives both the same shape. */
export type PartyKind = 'customer' | 'supplier';

export interface Party {
  id: string;
  name: string;
  phone: string | null;
  /** Paise still owed (by the customer to you, or by you to the supplier). Calculated by the server. */
  outstanding: number;
}

export interface PartyInput {
  name: string;
  /** "" clears the phone number. */
  phone?: string;
}

export interface PartyListParams {
  page: number;
  limit: number;
  search?: string | undefined;
}

export type EntryMode = 'CASH' | 'ONLINE' | 'CREDIT';

export interface LedgerEntry {
  type: 'SALE' | 'PURCHASE' | 'PAYMENT';
  /** Id of the sale, purchase or payment behind this line. */
  refId: string;
  date: string;
  /** Paise added to the balance (the unpaid part of a sale or purchase). */
  increase: number;
  /** Paise taken off the balance (a payment). */
  decrease: number;
  /** Balance after this line, from the server. */
  balance: number;
  mode: EntryMode;
  note: string | null;
  totalAmount: number | null;
  amountPaid: number | null;
}

export interface Ledger {
  party: { id: string; name: string; phone: string | null };
  /** Balance after the last entry over ALL pages. */
  balance: number;
  /** Balance just before the first entry on this page. */
  openingBalance: number;
  entries: LedgerEntry[];
  meta: PageMeta;
}

/** The same five calls for customers and suppliers; only the path differs. */
export const createPartyApi = (path: '/customers' | '/suppliers') => ({
  list: (params: PartyListParams, signal?: AbortSignal): Promise<Paged<Party>> =>
    getList<Party>(path, { ...params }, signal),
  get: (id: string, signal?: AbortSignal): Promise<Party> => getOne<Party>(`${path}/${id}`, signal),
  create: async (input: PartyInput): Promise<Party> =>
    (await api.post<ApiSuccess<Party>>(path, input)).data.data,
  update: async (id: string, input: Partial<PartyInput>): Promise<Party> =>
    (await api.patch<ApiSuccess<Party>>(`${path}/${id}`, input)).data.data,
  remove: async (id: string): Promise<void> => {
    await api.delete(`${path}/${id}`);
  },
  ledger: async (
    id: string,
    page: number,
    limit: number,
    signal?: AbortSignal,
  ): Promise<Ledger> => {
    const res = await api.get<ApiSuccess<Omit<Ledger, 'meta'>>>(`${path}/${id}/ledger`, {
      params: { page, limit },
      ...(signal ? { signal } : {}),
    });
    if (!res.data.meta) throw new Error('The server answered without paging details');
    return { ...res.data.data, meta: res.data.meta };
  },
});

export type PartyApi = ReturnType<typeof createPartyApi>;
