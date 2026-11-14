import { fetchJson } from './api';
import { getCurrency } from './currencies';
import {
  ConversionRow,
  HistoryRange,
  InitialValuesType,
  RatePoint
} from './types';

type RateRow = { date: string; base: string; quote: string; rate: number };

const LATEST_TTL = 10 * 60 * 1000;
const cache = new Map<string, { at: number; value: Promise<any> }>();

/** Memoises a request. Failed requests are dropped so they can be retried. */
function cached<T>(
  key: string,
  ttl: number,
  load: () => Promise<T>
): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttl) return hit.value;
  const value = load().catch((error) => {
    cache.delete(key);
    throw error;
  });
  cache.set(key, { at: Date.now(), value });
  return value;
}

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** Rates for 1 unit of `from`, keyed by quote currency. */
function getRates(
  from: string,
  targets: string[],
  date?: string
): Promise<Record<string, number>> {
  const quotes = targets.filter((code) => code !== from);
  if (quotes.length === 0) return Promise.resolve({});
  const key = `rates|${from}|${[...quotes].sort().join(',')}|${
    date ?? 'latest'
  }`;
  // A past date never changes, so it can be cached for good.
  return cached(key, date ? Infinity : LATEST_TTL, async () => {
    const query = `/rates?base=${from}&quotes=${quotes.join(',')}${
      date ? `&date=${date}` : ''
    }`;
    const rows = await fetchJson<RateRow[]>(query);
    return Object.fromEntries(rows.map((row) => [row.quote, row.rate]));
  });
}

const formatRate = (rate: number) =>
  new Intl.NumberFormat('en', { maximumSignificantDigits: 6 }).format(rate);

function formatAmount(value: number, code: string, precision: number) {
  // Crypto amounts are often tiny, so they get more decimals.
  const isCrypto = getCurrency(code).kind === 'crypto';
  return new Intl.NumberFormat('en', {
    minimumFractionDigits: isCrypto ? 0 : precision,
    maximumFractionDigits: isCrypto ? Math.max(precision, 8) : precision
  }).format(value);
}

/**
 * Converts the entered amount into every target currency.
 * Rates are cached, so typing a new amount does not hit the API again.
 */
export async function main(
  input: string,
  options: InitialValuesType
): Promise<ConversionRow[]> {
  const date = options.historical && options.date ? options.date : undefined;
  const rates = await getRates(options.from, options.targets, date);

  const amount = parseFloat(input);
  const validAmount = isFinite(amount) && amount >= 0;

  return options.targets.map((code) => {
    const rate = code === options.from ? 1 : rates[code];
    if (rate === undefined) return { code, amount: '', unavailable: true };
    return {
      code,
      rate: formatRate(rate),
      amount: validAmount
        ? formatAmount(amount * rate, code, options.precision)
        : ''
    };
  });
}

// ---- Rate history ---------------------------------------------------------

const RANGE_DAYS: Record<Exclude<HistoryRange, 'MAX'>, number> = {
  '1W': 7,
  '1M': 30,
  '3M': 91,
  '1Y': 365,
  '5Y': 1826
};

/** The API has one rate per day, so longer ranges are grouped into candles. */
const DAYS_PER_CANDLE: Record<HistoryRange, number> = {
  '1W': 1,
  '1M': 1,
  '3M': 1,
  '1Y': 7,
  '5Y': 30,
  MAX: 90
};

function toCandles(rows: RateRow[], daysPerCandle: number): RatePoint[] {
  const points: RatePoint[] = [];
  let previousClose = rows[0]?.rate ?? 0;
  for (let i = 0; i < rows.length; i += daysPerCandle) {
    const group = rows.slice(i, i + daysPerCandle);
    const rates = group.map((r) => r.rate);
    const close = rates[rates.length - 1];
    points.push({
      time: group[0].date,
      open: previousClose,
      high: Math.max(previousClose, ...rates),
      low: Math.min(previousClose, ...rates),
      close
    });
    previousClose = close;
  }
  return points;
}

/** Rate history from `from` to `to`, oldest first. [] when there is no data. */
export async function getRateHistory(
  from: string,
  to: string,
  range: HistoryRange
): Promise<RatePoint[]> {
  if (from === to) return [];

  const today = new Date();
  const earliest = [getCurrency(from).startDate, getCurrency(to).startDate]
    .filter((d): d is string => !!d)
    .sort()
    .pop();

  let start: string;
  if (range === 'MAX') {
    start = earliest ?? '1999-01-04';
  } else {
    const d = new Date(today);
    d.setDate(d.getDate() - RANGE_DAYS[range]);
    start = isoDate(d);
    if (earliest && start < earliest) start = earliest;
  }
  const end = isoDate(today);

  const rows = await cached(
    `history|${from}|${to}|${range}|${end}`,
    LATEST_TTL,
    () =>
      fetchJson<RateRow[]>(
        `/rates?base=${from}&quotes=${to}&from=${start}&to=${end}`
      )
  );
  return rows.length ? toCandles(rows, DAYS_PER_CANDLE[range]) : [];
}
