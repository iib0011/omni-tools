import { InitialValuesType } from './types';

function compute(input: string, options: InitialValuesType): string {
  return (!options.caseSensitive ? input.toLowerCase() : input)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function slugGenerator(
  input: string,
  options: InitialValuesType
): string {
  return input
    .split('\n')
    .map((line) => (line.trim() === '' ? '' : compute(line, options)))
    .join('\n');
}
