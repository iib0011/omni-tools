export function formatPageNumber(
  template: string,
  pageIndex: number,
  totalPages: number,
  startingPageNumber: number
): string {
  const current = startingPageNumber + pageIndex;
  return template
    .replaceAll('{current}', String(current))
    .replaceAll('{total}', String(totalPages));
}

export function formatBatesNumber(
  pageIndex: number,
  start: number,
  padding: number,
  prefix: string,
  suffix: string
): string {
  const value = String(start + pageIndex).padStart(Math.max(1, padding), '0');
  return `${prefix}${value}${suffix}`;
}

export function validateNumberTemplate(template: string): boolean {
  return template.includes('{current}') || template.includes('{total}');
}
