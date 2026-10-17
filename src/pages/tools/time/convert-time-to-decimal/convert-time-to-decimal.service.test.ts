import { expect, describe, it } from 'vitest';
import { convertTimeToDecimal } from './service';

describe('convert-time-to-decimal', () => {
  it('should convert time to decimal with default decimal places', () => {
    const input = '31:23:59';
    const result = convertTimeToDecimal(input, { decimalPlaces: '6' });
    expect(result).toBe('31.399722');
  });

  it('should convert time to decimal with specified decimal places', () => {
    const input = '31:23:59';
    const result = convertTimeToDecimal(input, { decimalPlaces: '10' });
    expect(result).toBe('31.3997222222');
  });

  it('should convert time to decimal with supplied format of HH:MM:SS', () => {
    const input = '13:25:30';
    const result = convertTimeToDecimal(input, { decimalPlaces: '6' });
    expect(result).toBe('13.425000');
  });

  it('should convert time to decimal with supplied format of HH:MM', () => {
    const input = '13:25';
    const result = convertTimeToDecimal(input, { decimalPlaces: '6' });
    expect(result).toBe('13.416667');
  });

  it('should convert time to decimal with supplied format of HH:MM:', () => {
    const input = '13:25';
    const result = convertTimeToDecimal(input, { decimalPlaces: '6' });
    expect(result).toBe('13.416667');
  });

  it('should convert time to decimal with supplied format of HH.MM.SS', () => {
    const input = '13.25.30';
    const result = convertTimeToDecimal(input, { decimalPlaces: '6' });
    expect(result).toBe('13.425000');
  });
});
