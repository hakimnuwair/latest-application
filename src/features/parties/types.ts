import type { PartyApi, PartyKind } from '../../api/parties';

/**
 * Everything that differs between the customer screens and the supplier screens: the API, the route and the
 * words. The shared screens in this folder read it, so no screen is written twice.
 */
export interface PartyConfig {
  kind: PartyKind;
  api: PartyApi;
  /** Route of the list, for example "/admin/customers". A party's ledger is `${base}/${id}`. */
  base: string;
  title: string;
  /** "customer", used in sentences. */
  singular: string;
  description: string;
  addLabel: string;
  searchPlaceholder: string;
  emptyMessage: string;
  /** Heading of the balance: "Owes you" or "You owe". */
  owedHeading: string;
  /** Text for a balance in a sentence, for example "owes you ₹500" or "you owe ₹500". */
  owedText: (paise: number) => string;
  /** Text under the balance when nothing is outstanding. */
  settledText: string;
  /** Name of the main button and the modal: "Record payment" or "Pay supplier". */
  payLabel: string;
  /** Label of a payment line in the ledger: "Payment received" or "Payment made". */
  paymentEntryLabel: string;
  /** Label of a sale or purchase line. */
  chargeEntryLabel: string;
  /** Toast sentence for what is outstanding after a payment change. */
  afterText: (paise: number) => string;
  /**
   * Where a sale or purchase line links to. Left out until that screen exists (12c-2b adds it for sales,
   * 12c-2c for purchases); until then the line is plain text.
   */
  chargeLink?: (refId: string) => string;
}
