export function decodeString(input: string): string {
  if (!input) return '';
  return decodeURIComponent(input);
}
