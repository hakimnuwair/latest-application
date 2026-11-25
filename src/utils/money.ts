/** Money arrives from the API in paise (integers). Only this file converts it for display. */
const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const formatINR = (paise: number): string => inr.format(paise / 100);

/** "1250.50" typed by the user -> 125050 paise. Returns null for anything that is not a valid amount. */
export const rupeesToPaise = (text: string): number | null => {
  const clean = text.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return null;
  const [whole = '0', fraction = ''] = clean.split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
};
