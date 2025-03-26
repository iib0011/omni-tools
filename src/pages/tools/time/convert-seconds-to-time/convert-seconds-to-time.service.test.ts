import { describe, it, expect } from 'vitest';
import { convertSecondsToTime } from './service';

describe('convertSecondsToTime', () => {
  it('should convert seconds to a formatted time string', () => {
    const result = convertSecondsToTime('3661', true);
    expect(result).toBe('01:01:01');
  });

  it('should handle zero seconds', () => {
    const result = convertSecondsToTime('0', true);
    expect(result).toBe('00:00:00');
  });

  it('should handle seconds less than a minute', () => {
    const result = convertSecondsToTime('45', true);
    expect(result).toBe('00:00:45');
  });

  it('should handle seconds equal to a full minute', () => {
    const result = convertSecondsToTime('60', true);
    expect(result).toBe('00:01:00');
  });

  it('should handle seconds equal to a full hour', () => {
    const result = convertSecondsToTime('3600', true);
    expect(result).toBe('01:00:00');
  });
  it('should handle seconds equal to a full hour without padding', () => {
    const result = convertSecondsToTime('3600', false);
    expect(result).toBe('1:0:0');
  });

  it('should handle large numbers of seconds with padding', () => {
    const result = convertSecondsToTime('7325', true);
    expect(result).toBe('02:02:05');
  });
  it('should handle large numbers of seconds without padding', () => {
    const result = convertSecondsToTime('7325', false);
    expect(result).toBe('2:2:5');
  });
  it('should handle numbers of seconds on multilines without padding', () => {
    const result = convertSecondsToTime('7325\n3600\n5c\n60', false);
    expect(result).toBe('2:2:5\n1:0:0\n\n0:1:0');
  });
  it('should handle numbers of seconds on multilines with padding', () => {
    const result = convertSecondsToTime('7325\n3600\n5c\n60', true);
    expect(result).toBe('02:02:05\n01:00:00\n\n00:01:00');
  });
});
