// Frankfurter API (https://frankfurter.dev) – free, no API key, CORS enabled.
export const API_BASE = 'https://api.frankfurter.dev/v2';

export async function fetchJson<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`);
  } catch {
    throw new Error('Could not reach the exchange-rate service');
  }
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(
        'No rate available for that date or currency (older dates are only available for some currencies)'
      );
    }
    let message = '';
    try {
      message = (await res.json()).message;
    } catch {
      // ignore – fall back to the status code
    }
    throw new Error(message || `Exchange-rate request failed (${res.status})`);
  }
  return res.json();
}
