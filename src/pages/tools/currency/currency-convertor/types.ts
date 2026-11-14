export type InitialValuesType = {
  /** Source currency code, e.g. 'USD' */
  from: string;
  /** Ordered list of target currency codes (the user can reorder it) */
  targets: string[];
  /** Decimal places shown in the converted amounts */
  precision: number;
  /** Use the exchange rate of a past day instead of the latest one */
  historical: boolean;
  /** Rate date (YYYY-MM-DD), used when `historical` is on */
  date: string;
  includeCrypto: boolean;
  showFlags: boolean;
};

/** One row of the converted list, produced by `main()` in service.ts */
export type ConversionRow = {
  code: string;
  /** Already formatted amount; empty string while not available */
  amount: string;
  /** Rate for 1 unit of the source currency, shown in the rate card */
  rate?: string;
  /** True when the API has no rate for this currency (e.g. on that date) */
  unavailable?: boolean;
};

export type HistoryRange = '1W' | '1M' | '3M' | '1Y' | '5Y' | 'MAX';

/** One point of the rate-history chart. For a line chart only `close` is used. */
export type RatePoint = {
  /** Label shown on the x axis, e.g. '2026-03-14' */
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
};
