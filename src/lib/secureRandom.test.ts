import { describe, expect, it } from 'vitest';
import { getSecureRandomInt } from './secureRandom';

describe('getSecureRandomInt', () => {
  it('should return a value within [0, max)', () => {
    for (let i = 0; i < 1000; i++) {
      const result = getSecureRandomInt(10);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(10);
    }
  });

  it('should return 0 when max is 1', () => {
    for (let i = 0; i < 100; i++) {
      const result = getSecureRandomInt(1);
      expect(result).toBe(0);
    }
  });

  it('should throw for max <= 0', () => {
    expect(() => getSecureRandomInt(0)).toThrow();
    expect(() => getSecureRandomInt(-1)).toThrow();
  });

  it('should throw for non-integer max', () => {
    expect(() => getSecureRandomInt(1.5)).toThrow();
  });

  it('should produce a roughly uniform distribution', () => {
    const max = 4;
    const counts = new Array(max).fill(0);
    const iterations = 10000;

    for (let i = 0; i < iterations; i++) {
      counts[getSecureRandomInt(max)]++;
    }

    // Each value should appear roughly 1/4 of the time.
    // With 10000 iterations, we expect ~2500 each.
    // Allow a reasonable margin to avoid flaky tests.
    for (const count of counts) {
      expect(count).toBeGreaterThan(2000);
      expect(count).toBeLessThan(3000);
    }
  });

  it('should work with typical charset lengths', () => {
    // Test with common charset sizes used in password generation
    for (const max of [26, 52, 62, 90, 85]) {
      for (let i = 0; i < 100; i++) {
        const result = getSecureRandomInt(max);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThan(max);
      }
    }
  });
});
