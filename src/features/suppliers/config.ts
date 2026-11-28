import { suppliersApi } from '../../api/suppliers';
import { formatINR } from '../../utils/money';
import type { PartyConfig } from '../parties/types';

export const suppliersConfig: PartyConfig = {
  kind: 'supplier',
  api: suppliersApi,
  base: '/admin/suppliers',
  title: 'Suppliers',
  singular: 'supplier',
  description: 'People you buy from, and what you still owe them.',
  addLabel: 'Add supplier',
  searchPlaceholder: 'Search by name or phone',
  emptyMessage: 'Add a supplier to keep track of what you owe them.',
  owedHeading: 'You owe',
  owedText: (paise) => `you owe ${formatINR(paise)}`,
  settledText: 'All settled. Nothing to pay.',
  payLabel: 'Pay supplier',
  paymentEntryLabel: 'Payment made',
  chargeEntryLabel: 'Purchase',
  afterText: (paise) =>
    paise > 0 ? `You still owe ${formatINR(paise)}` : 'This supplier is all settled',
  chargeLink: (refId) => `/admin/purchases/${refId}`,
};
