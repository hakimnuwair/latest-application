import { z } from 'zod';

/** The simple fields of the purchase form. The product rows and the supplier are checked on the page. */
export const purchaseFormSchema = z.object({
  mode: z.enum(['CASH', 'ONLINE', 'CREDIT']),
  /** Rupees paid now. Only used for CASH and ONLINE. */
  paid: z.string(),
  purchasedAt: z.string().min(1, 'Choose the date and time of the purchase'),
});

export type PurchaseForm = z.infer<typeof purchaseFormSchema>;
