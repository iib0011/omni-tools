import { describe, expect, it } from 'vitest';
import { byteConverter } from './service';
import { InitialValuesType, DataUnit } from './types';

describe('byteConverter', () => {
  const makeOptions = (
    fromUnit: DataUnit,
    toUnit: DataUnit,
    precision: number
  ): InitialValuesType => ({
    fromUnit,
    toUnit,
    precision
  });

  it('converts bits to bytes', () => {
    expect(byteConverter('8', makeOptions('b', 'B', 2))).toBe('1');
    expect(byteConverter('1', makeOptions('b', 'B', 4))).toBe('0.125');
  });

  it('converts bytes to bits', () => {
    expect(byteConverter('1', makeOptions('B', 'b', 0))).toBe('8');
  });

  it('converts decimal units correctly', () => {
    expect(byteConverter('1', makeOptions('KB', 'B', 0))).toBe('1000');
    expect(byteConverter('1', makeOptions('MB', 'KB', 0))).toBe('1000');
    expect(byteConverter('1', makeOptions('GB', 'MB', 0))).toBe('1000');
  });

  it('converts binary units correctly', () => {
    expect(byteConverter('1', makeOptions('KiB', 'B', 0))).toBe('1024');
    expect(byteConverter('1', makeOptions('MiB', 'KiB', 0))).toBe('1024');
    expect(byteConverter('1', makeOptions('GiB', 'MiB', 0))).toBe('1024');
  });

  it('converts decimal to binary units correctly', () => {
    expect(byteConverter('1', makeOptions('GB', 'MiB', 2))).toBe('953.67');
    expect(byteConverter('1', makeOptions('TB', 'GiB', 2))).toBe('931.32');
  });

  it('converts binary to decimal units correctly', () => {
    expect(byteConverter('1', makeOptions('GiB', 'MB', 2))).toBe('1073.74');
    expect(byteConverter('1', makeOptions('TiB', 'GB', 2))).toBe('1099.51');
  });

  it('respects precision rounding', () => {
    expect(byteConverter('1', makeOptions('GB', 'MiB', 0))).toBe('954');
    expect(byteConverter('1', makeOptions('GB', 'MiB', 1))).toBe('953.7');
    expect(byteConverter('1', makeOptions('GB', 'MiB', 3))).toBe('953.674');
  });

  it('handles zero correctly', () => {
    expect(byteConverter('0', makeOptions('GB', 'MB', 2))).toBe('0');
  });

  it('handles identity conversions', () => {
    expect(byteConverter('123', makeOptions('MB', 'MB', 2))).toBe('123');
    expect(byteConverter('1', makeOptions('GiB', 'GiB', 5))).toBe('1');
  });

  it('handles large values', () => {
    expect(byteConverter('1024', makeOptions('GiB', 'TiB', 4))).toBe('1');
  });

  it('handles multiline input', () => {
    const input = '1\n2\n3';
    const result = byteConverter(input, makeOptions('GB', 'MB', 0));
    expect(result).toBe('1000\n2000\n3000');
  });

  it('ignores empty lines', () => {
    const input = '1\n\n3';
    const result = byteConverter(input, makeOptions('GB', 'MB', 0));
    expect(result).toBe('1000\n\n3000');
  });
});
