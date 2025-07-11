import { InitialValuesType } from './types';

export function epochToDate(input: string): string {
  const num = Number(input);
  if (isNaN(num)) return 'Invalid epoch timestamp.';
  // Support both seconds and milliseconds
  const date = new Date(num > 1e12 ? num : num * 1000);
  if (isNaN(date.getTime())) return 'Invalid epoch timestamp.';
  return date.toUTCString();
}

export function dateToEpoch(input: string): string {
  const date = new Date(input);
  if (isNaN(date.getTime())) return 'Invalid date string.';
  return Math.floor(date.getTime() / 1000).toString();
}

export function main(input: string, _options: any): string {
  if (!input.trim()) return '';
  // If input is a number, treat as epoch
  if (/^-?\d+(\.\d+)?$/.test(input.trim())) {
    return epochToDate(input.trim());
  }
  // Otherwise, treat as date string
  return dateToEpoch(input.trim());
}
