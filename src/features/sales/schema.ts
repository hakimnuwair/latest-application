import { z } from 'zod';
import type { EntryMode } from '../../api/parties';

/** The simple fields of the sale form. The product rows and the customer are checked on the page. */
export const saleFormSchema = z.object({
  mode: z.enum(['CASH', 'ONLINE', 'CREDIT']),
  /** Rupees paid now. Only used for CASH and ONLINE. */
  paid: z.string(),
  soldAt: z.string().min(1, 'Choose the date and time of the sale'),
});

export type SaleForm = z.infer<typeof saleFormSchema>;

export const MODE_OPTIONS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'CREDIT', label: 'Credit' },
] as const;

export const MODE_LABEL: Record<EntryMode, string> = {
  CASH: 'Cash',
  ONLINE: 'Online',
  CREDIT: 'Credit',
};
