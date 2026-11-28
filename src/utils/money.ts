/** Money arrives from the API in paise (integers). Only this file converts it for display. */
const inrWhole = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const inrExact = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 125000 -> "₹1,250"; 125050 -> "₹1,250.50" (never "₹1,250.5"). */
export const formatINR = (paise: number): string =>
  paise % 100 === 0 ? inrWhole.format(paise / 100) : inrExact.format(paise / 100);

/** "1250.50" typed by the user -> 125050 paise. Returns null for anything that is not a valid amount. */
export const rupeesToPaise = (text: string): number | null => {
  const clean = text.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return null;
  const [whole = '0', fraction = ''] = clean.split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
};

/** The API stores money in a 32-bit integer of paise: the most it accepts. */
export const MAX_PAISE = 2_147_483_647;

/** For forms: true when the text is a valid, in-range rupee amount ("1250", "1250.5"). */
export const isMoneyText = (text: string): boolean => {
  const paise = rupeesToPaise(text);
  return paise !== null && paise <= MAX_PAISE;
};

/** Paise -> text to put in a MoneyInput when editing: 125000 -> "1250", 125050 -> "1250.50". */
export const paiseToRupeesText = (paise: number): string =>
  paise % 100 === 0 ? String(paise / 100) : (paise / 100).toFixed(2);
