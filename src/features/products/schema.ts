import { z } from 'zod';
import type { AdminProduct, ProductInput } from '../../api/products';
import { isMoneyText, paiseToRupeesText, rupeesToPaise } from '../../utils/money';

/** What the form holds: text for numbers, so the owner can type freely. Converted when saving. */
export const productFormSchema = z.object({
  name: z.string().trim().min(1, 'Enter the product name').max(120, 'At most 120 characters'),
  categoryId: z.string().min(1, 'Choose a category'),
  sellingPrice: z
    .string()
    .trim()
    .refine(isMoneyText, 'Enter an amount like 1250 or 1250.50 (up to 2 decimals, not too large)'),
  sku: z.string().trim().max(60, 'At most 60 characters'),
  description: z.string().trim().max(2000, 'At most 2000 characters'),
  lowStockAt: z
    .string()
    .trim()
    .regex(/^\d+$/, 'Enter a whole number, 0 or more')
    .refine((v) => Number(v) <= 1_000_000, 'At most 1,000,000'),
  showPrice: z.boolean(),
  showQuantity: z.boolean(),
  isActive: z.boolean(),
});
export type ProductForm = z.infer<typeof productFormSchema>;

export const FORM_FIELDS = [
  'name',
  'categoryId',
  'sellingPrice',
  'sku',
  'description',
  'lowStockAt',
  'showPrice',
  'showQuantity',
  'isActive',
] as const;

export const emptyProductForm = (categoryId = ''): ProductForm => ({
  name: '',
  categoryId,
  sellingPrice: '',
  sku: '',
  description: '',
  lowStockAt: '3',
  showPrice: true,
  showQuantity: false,
  isActive: true,
});

export const formFromProduct = (p: AdminProduct): ProductForm => ({
  name: p.name,
  categoryId: p.categoryId,
  sellingPrice: paiseToRupeesText(p.sellingPrice),
  sku: p.sku ?? '',
  description: p.description ?? '',
  lowStockAt: String(p.lowStockAt),
  showPrice: p.showPrice,
  showQuantity: p.showQuantity,
  isActive: p.isActive,
});

/** Form text -> what the API wants (paise, null for empty text). Call only after validation passed. */
export const toProductInput = (v: ProductForm): ProductInput => ({
  name: v.name,
  categoryId: v.categoryId,
  sellingPrice: rupeesToPaise(v.sellingPrice) ?? 0,
  sku: v.sku === '' ? null : v.sku,
  description: v.description === '' ? null : v.description,
  lowStockAt: Number(v.lowStockAt),
  showPrice: v.showPrice,
  showQuantity: v.showQuantity,
  isActive: v.isActive,
});

/** Only the fields that really changed, so an edit never touches anything else. */
export const changedFields = (next: ProductInput, current: AdminProduct): Partial<ProductInput> => {
  const now = toProductInput(formFromProduct(current));
  const out: Partial<ProductInput> = {};
  for (const key of FORM_FIELDS) {
    if (next[key] !== now[key]) Object.assign(out, { [key]: next[key] });
  }
  return out;
};
