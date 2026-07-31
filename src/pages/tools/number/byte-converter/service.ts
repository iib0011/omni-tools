import { DataUnit, InitialValuesType, UNIT_MAP } from './types';

function compute(
  value: number,
  fromUnit: DataUnit,
  toUnit: DataUnit,
  precision: number
): number {
  if (precision < 0 || value < 0) return 0;
  const bytes = value * UNIT_MAP[fromUnit];
  const result = bytes / UNIT_MAP[toUnit];
  return Number(result.toFixed(precision));
}

export function byteConverter(input: string, options: InitialValuesType) {
  if (!input) return '';

  const values = input.split('\n');
  const result: string[] = [];

  const { fromUnit, toUnit, precision } = options;

  for (const elem of values) {
    const trimmed = elem.trim();

    if (!trimmed) {
      result.push('');
      continue;
    }

    const computed = compute(Number(trimmed), fromUnit, toUnit, precision);
    result.push(String(computed));
  }

  return result.join('\n');
}
