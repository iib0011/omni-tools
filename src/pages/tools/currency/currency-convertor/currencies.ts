import { useEffect, useState } from 'react';
import { fetchJson } from './api';

export type CurrencyInfo = {
  code: string;
  name: string;
  kind: 'fiat' | 'crypto';
  /** Symbol shown instead of a flag (crypto only) */
  symbol?: string;
  /** First date the API has rates for (YYYY-MM-DD) */
  startDate?: string;
};

// Used until (or if) the list could not be loaded from the API.
const FALLBACK: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar', kind: 'fiat' },
  { code: 'EUR', name: 'Euro', kind: 'fiat' },
  { code: 'GBP', name: 'British Pound', kind: 'fiat' },
  { code: 'INR', name: 'Indian Rupee', kind: 'fiat' },
  { code: 'JPY', name: 'Japanese Yen', kind: 'fiat' },
  { code: 'CNY', name: 'Chinese Yuan', kind: 'fiat' },
  { code: 'AUD', name: 'Australian Dollar', kind: 'fiat' },
  { code: 'CAD', name: 'Canadian Dollar', kind: 'fiat' },
  { code: 'CHF', name: 'Swiss Franc', kind: 'fiat' },
  { code: 'SGD', name: 'Singapore Dollar', kind: 'fiat' },
  { code: 'AED', name: 'UAE Dirham', kind: 'fiat' },
  { code: 'BTC', name: 'Bitcoin', kind: 'crypto', symbol: '₿' },
  { code: 'ETH', name: 'Ethereum', kind: 'crypto', symbol: 'Ξ' }
];

type ApiCurrency = {
  iso_code: string;
  name: string;
  symbol: string | null;
  type: 'currency' | 'crypto' | 'metal';
  start_date: string | null;
};

let currencies: CurrencyInfo[] = FALLBACK;
let loading: Promise<CurrencyInfo[]> | null = null;

export function loadCurrencies(): Promise<CurrencyInfo[]> {
  if (!loading) {
    loading = fetchJson<ApiCurrency[]>('/currencies')
      .then((list) => {
        currencies = list
          .filter((c) => c.type !== 'metal')
          .map<CurrencyInfo>((c) => ({
            code: c.iso_code,
            name: c.name,
            kind: c.type === 'crypto' ? 'crypto' : 'fiat',
            symbol: c.symbol ?? undefined,
            startDate: c.start_date ?? undefined
          }))
          .sort((a, b) => a.code.localeCompare(b.code));
        return currencies;
      })
      .catch(() => {
        loading = null; // allow a retry next time
        return currencies;
      });
  }
  return loading;
}

/** Returns the currency list and re-renders the caller once it has loaded. */
export function useCurrencies(): CurrencyInfo[] {
  const [list, setList] = useState(currencies);
  useEffect(() => {
    let cancelled = false;
    loadCurrencies().then((l) => !cancelled && setList(l));
    return () => {
      cancelled = true;
    };
  }, []);
  return list;
}

export const getCurrency = (code: string): CurrencyInfo =>
  currencies.find((c) => c.code === code) ?? {
    code,
    name: code,
    kind: 'fiat'
  };

/** Turns a 2-letter country code into the regional-indicator flag emoji */
const flagEmoji = (country: string) =>
  country
    .toUpperCase()
    .replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)));

export const getFlag = (code: string): string => {
  const c = getCurrency(code);
  if (c.kind === 'crypto') return c.symbol ?? '🪙';
  // Fiat codes start with their country code (USD -> US); X* codes are
  // supranational (XAF, XCD…) and have no flag.
  if (code.startsWith('X')) return '💱';
  return flagEmoji(code.slice(0, 2));
};

export const availableCurrencies = (includeCrypto: boolean) =>
  currencies.filter((c) => includeCrypto || c.kind === 'fiat');
