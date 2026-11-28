import { customersApi } from '../../api/customers';
import { formatINR } from '../../utils/money';
import type { PartyConfig } from '../parties/types';

export const customersConfig: PartyConfig = {
  kind: 'customer',
  api: customersApi,
  base: '/admin/customers',
  title: 'Customers',
  singular: 'customer',
  description: 'People you sell to, and what they still owe you.',
  addLabel: 'Add customer',
  searchPlaceholder: 'Search by name or phone',
  emptyMessage: 'Add a customer to keep track of what they owe you.',
  owedHeading: 'Owes you',
  owedText: (paise) => `owes you ${formatINR(paise)}`,
  settledText: 'All settled. Nothing to collect.',
  payLabel: 'Record payment',
  paymentEntryLabel: 'Payment received',
  chargeEntryLabel: 'Sale',
  afterText: (paise) =>
    paise > 0 ? `${formatINR(paise)} still to collect` : 'This customer is all settled',
  chargeLink: (refId) => `/admin/sales/${refId}`,
};
