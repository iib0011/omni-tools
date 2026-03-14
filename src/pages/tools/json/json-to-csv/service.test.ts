import { describe, it, expect } from 'vitest';
import { convertJsonToCsv } from './service';

const defaultOptions: Parameters<typeof convertJsonToCsv>[1] = {
  delimiter: ',',
  includeHeaders: true,
  quoteStrings: 'auto'
};

describe('convertJsonToCsv', () => {
  it('converts simple JSON array to CSV', () => {
    const input = JSON.stringify([
      { name: 'Dhee', age: 20 },
      { name: 'Jarvis', age: 999 }
    ]);

    const result = convertJsonToCsv(input, defaultOptions);

    expect(result).toBe(
      `name,age
Dhee,20
Jarvis,999`
    );
  });

  it('handles a single object', () => {
    const input = JSON.stringify({
      name: 'Dhee',
      age: 20
    });

    const result = convertJsonToCsv(input, defaultOptions);

    expect(result).toBe(
      `name,age
Dhee,20`
    );
  });

  it('flattens nested objects', () => {
    const input = JSON.stringify([
      {
        name: 'Dhee',
        info: { age: 20, city: 'Pune' }
      }
    ]);

    const result = convertJsonToCsv(input, defaultOptions);

    expect(result).toBe(
      `name,info.age,info.city
Dhee,20,Pune`
    );
  });

  it('throws error for invalid JSON', () => {
    const input = 'invalid json';

    expect(() => convertJsonToCsv(input, defaultOptions)).toThrow();
  });
});
