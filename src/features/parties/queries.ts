import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PartyInput, PartyListParams } from '../../api/parties';
import {
  createPayment,
  deletePayment,
  updatePayment,
  type NewPayment,
  type PaymentChanges,
} from '../../api/payments';
import { invalidateLedger, invalidateParties, keys } from '../../api/queryKeys';
import type { PartyConfig } from './types';

export const LEDGER_PAGE_SIZE = 100;

const partyKey = (config: PartyConfig) =>
  config.kind === 'customer' ? keys.customers : keys.suppliers;

export const usePartyList = (config: PartyConfig, params: PartyListParams) =>
  useQuery({
    queryKey: [...partyKey(config), 'list', params],
    queryFn: ({ signal }) => config.api.list(params, signal),
    placeholderData: keepPreviousData,
  });

export const useLedger = (config: PartyConfig, id: string, page: number) =>
  useQuery({
    queryKey: [...keys.ledger(config.kind, id), page],
    queryFn: ({ signal }) => config.api.ledger(id, page, LEDGER_PAGE_SIZE, signal),
    placeholderData: keepPreviousData,
  });

/** Adds a party (no id) or edits one (id). */
export const useSaveParty = (config: PartyConfig) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id?: string | undefined; values: PartyInput }) =>
      input.id ? config.api.update(input.id, input.values) : config.api.create(input.values),
    onSuccess: (party) =>
      Promise.all([
        invalidateParties(qc, config.kind),
        invalidateLedger(qc, config.kind, party.id),
      ]),
  });
};

export const useDeleteParty = (config: PartyConfig) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => config.api.remove(id),
    onSuccess: () => invalidateParties(qc, config.kind),
  });
};

export const useCreatePayment = (config: PartyConfig, partyId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<NewPayment, 'kind' | 'partyId'>) =>
      createPayment({ ...input, kind: config.kind, partyId }),
    onSuccess: () => invalidateLedger(qc, config.kind, partyId),
  });
};

export const useUpdatePayment = (config: PartyConfig, partyId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; changes: PaymentChanges }) =>
      updatePayment(input.id, input.changes),
    onSuccess: () => invalidateLedger(qc, config.kind, partyId),
  });
};

export const useDeletePayment = (config: PartyConfig, partyId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePayment(id),
    onSuccess: () => invalidateLedger(qc, config.kind, partyId),
  });
};
