import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getRateHistory, main } from './service';
import { InitialValuesType } from './types';

const options: InitialValuesType = {
  from: 'USD',
  targets: ['INR', 'EUR'],
  precision: 2,
  historical: false,
  date: '2010-01-04',
  includeCrypto: false,
  showFlags: true
};

const mockFetch = (handler: (url: string) => unknown, status = 200) => {
  const fetchMock = vi.fn(async (url: string) => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => handler(url)
  }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

describe('currency-convertor', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('converts the amount with the fetched rates', async () => {
    mockFetch(() => [
      { date: '2026-01-01', base: 'USD', quote: 'INR', rate: 90 },
      { date: '2026-01-01', base: 'USD', quote: 'EUR', rate: 0.9 }
    ]);
    const rows = await main('100', { ...options, from: 'USD' });
    expect(rows).toEqual([
      { code: 'INR', rate: '90', amount: '9,000.00' },
      { code: 'EUR', rate: '0.9', amount: '90.00' }
    ]);
  });

  it('returns rates but no amounts for an empty or negative input', async () => {
    mockFetch(() => [
      { date: '2026-01-02', base: 'GBP', quote: 'INR', rate: 100 }
    ]);
    const opts = { ...options, from: 'GBP', targets: ['INR'] };
    expect((await main('', opts))[0]).toEqual({
      code: 'INR',
      rate: '100',
      amount: ''
    });
    expect((await main('-5', opts))[0].amount).toBe('');
  });

  it('marks currencies without a rate as unavailable', async () => {
    mockFetch(() => []);
    const rows = await main('1', {
      ...options,
      from: 'JPY',
      targets: ['CHF']
    });
    expect(rows).toEqual([{ code: 'CHF', amount: '', unavailable: true }]);
  });

  it('uses rate 1 for the source currency without calling the API', async () => {
    const fetchMock = mockFetch(() => []);
    const rows = await main('5', { ...options, from: 'SGD', targets: ['SGD'] });
    expect(rows[0]).toEqual({ code: 'SGD', rate: '1', amount: '5.00' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('requests the chosen date in historical mode', async () => {
    const fetchMock = mockFetch(() => [
      { date: '2010-01-04', base: 'CAD', quote: 'AUD', rate: 1.05 }
    ]);
    await main('1', {
      ...options,
      from: 'CAD',
      targets: ['AUD'],
      historical: true,
      date: '2010-01-04'
    });
    expect(fetchMock.mock.calls[0][0]).toContain('date=2010-01-04');
  });

  it('turns an API error into a readable message', async () => {
    mockFetch(() => ({ message: 'boom' }), 500);
    await expect(
      main('1', { ...options, from: 'NOK', targets: ['SEK'] })
    ).rejects.toThrow('boom');
  });

  it('groups daily rates into candles for longer ranges', async () => {
    const rows = Array.from({ length: 14 }, (_, i) => ({
      date: `2026-02-${String(i + 1).padStart(2, '0')}`,
      base: 'USD',
      quote: 'MXN',
      rate: 10 + i
    }));
    mockFetch(() => rows);
    const candles = await getRateHistory('USD', 'MXN', '1Y');
    expect(candles).toHaveLength(2); // 14 days / 7 per candle
    expect(candles[0]).toMatchObject({
      open: 10,
      close: 16,
      low: 10,
      high: 16
    });
    expect(candles[1]).toMatchObject({ open: 16, close: 23 });
  });

  it('returns no history for the same currency twice', async () => {
    expect(await getRateHistory('USD', 'USD', '1M')).toEqual([]);
  });
});
