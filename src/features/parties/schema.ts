import { z } from 'zod';
import { isMoneyText, rupeesToPaise } from '../../utils/money';
import { nowForInput } from '../../utils/dates';

export const partyFormSchema = z.object({
  name: z.string().trim().min(1, 'Enter a name').max(120, 'At most 120 characters'),
  phone: z.string().trim().max(30, 'At most 30 characters'),
});
export type PartyForm = z.infer<typeof partyFormSchema>;

export const paymentFormSchema = z.object({
  amount: z
    .string()
    .trim()
    .refine(isMoneyText, 'Enter an amount like 500 or 499.50')
    .refine((v) => (rupeesToPaise(v) ?? 0) > 0, 'Amount must be more than 0'),
  mode: z.enum(['CASH', 'ONLINE']),
  note: z.string().trim().max(200, 'At most 200 characters'),
  paidAt: z
    .string()
    .min(1, 'Pick a date and time')
    // Both are "YYYY-MM-DDTHH:mm" in India time, so comparing the text compares the time.
    .refine((v) => v <= nowForInput(), 'The date cannot be in the future'),
});
export type PaymentForm = z.infer<typeof paymentFormSchema>;
