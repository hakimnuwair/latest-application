import { api } from './client';
import type { PartyKind } from './parties';
import type { ApiSuccess } from './types';

export type PaymentMode = 'CASH' | 'ONLINE';

export interface PaymentResult {
  id: string;
  customerId: string | null;
  supplierId: string | null;
  amount: number;
  mode: PaymentMode;
  note: string | null;
  paidAt: string;
  /** Paise still outstanding with this customer or supplier after this change. */
  outstandingAfter: number;
}

export interface NewPayment {
  kind: PartyKind;
  partyId: string;
  /** Paise. */
  amount: number;
  mode: PaymentMode;
  note?: string;
  /** ISO text with +05:30. Left out means now. */
  paidAt?: string;
}

/** Only the fields that changed are sent. A "" note clears it. */
export interface PaymentChanges {
  amount?: number;
  mode?: PaymentMode;
  note?: string;
  paidAt?: string;
}

export const createPayment = async (input: NewPayment): Promise<PaymentResult> => {
  const body = {
    ...(input.kind === 'customer' ? { customerId: input.partyId } : { supplierId: input.partyId }),
    amount: input.amount,
    mode: input.mode,
    ...(input.note ? { note: input.note } : {}),
    ...(input.paidAt ? { paidAt: input.paidAt } : {}),
  };
  return (await api.post<ApiSuccess<PaymentResult>>('/payments', body)).data.data;
};

export const updatePayment = async (id: string, changes: PaymentChanges): Promise<PaymentResult> =>
  (await api.patch<ApiSuccess<PaymentResult>>(`/payments/${id}`, changes)).data.data;

export const deletePayment = async (id: string): Promise<{ outstandingAfter: number }> =>
  (await api.delete<ApiSuccess<{ deleted: true; outstandingAfter: number }>>(`/payments/${id}`))
    .data.data;
