import type { AdminProduct } from '../../api/products';
import { isMoneyText, paiseToRupeesText, rupeesToPaise } from '../../utils/money';

/** One row of a sale or purchase while it is being typed. Quantity and price stay as text until saving. */
export interface OrderLine {
  productId: string;
  name: string;
  sku: string | null;
  /** Stock when the product was picked. Only a hint; the server checks the real stock. */
  stockQty: number;
  qty: string;
  /** Rupees, for example "1250.50". */
  price: string;
}

export const MAX_QTY = 1_000_000;

export const newLine = (product: AdminProduct, paise: number): OrderLine => ({
  productId: product.id,
  name: product.name,
  sku: product.sku,
  stockQty: product.stockQty,
  qty: '1',
  price: paiseToRupeesText(paise),
});

/** Whole pieces 1 to 1,000,000, or null when the text is not that. */
export const parseQty = (text: string): number | null => {
  if (!/^\d{1,7}$/.test(text)) return null;
  const n = Number(text);
  return n >= 1 && n <= MAX_QTY ? n : null;
};

export const linePaise = (line: OrderLine): number | null =>
  isMoneyText(line.price) ? rupeesToPaise(line.price) : null;

/** Preview of one row's total in paise (0 while the row is not valid yet). The server works out the real one. */
export const lineTotal = (line: OrderLine): number => {
  const qty = parseQty(line.qty);
  const price = linePaise(line);
  return qty !== null && price !== null ? qty * price : 0;
};

export const orderTotal = (lines: readonly OrderLine[]): number =>
  lines.reduce((sum, line) => sum + lineTotal(line), 0);

/** First problem in the rows as a sentence, or null when they are fine to send. */
export const firstLineProblem = (lines: readonly OrderLine[]): string | null => {
  if (lines.length === 0) return 'Add at least one product';
  for (const line of lines) {
    if (parseQty(line.qty) === null) return `"${line.name}": enter a quantity of 1 or more`;
    if (linePaise(line) === null) return `"${line.name}": enter a price like 1250 or 1250.50`;
  }
  return null;
};
