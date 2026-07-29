import { WorkbenchError } from './errors';

export interface PageRangeOptions {
  empty?: 'all' | 'none';
}

function invalidRange(message: string): never {
  throw new WorkbenchError({
    code: 'invalid-page-range',
    message
  });
}

export function parsePageRanges(
  input: string,
  totalPages: number,
  options: PageRangeOptions = {}
): number[] {
  if (!Number.isInteger(totalPages) || totalPages < 1) {
    invalidRange('The PDF must contain at least one page.');
  }

  const value = input.trim();
  if (!value) {
    return options.empty === 'none'
      ? []
      : Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const selected = new Set<number>();
  for (const rawToken of value.split(',')) {
    const token = rawToken.trim();
    if (!token) invalidRange('Page ranges cannot contain empty entries.');

    const match = /^(\d+)(?:\s*-\s*(\d+))?$/.exec(token);
    if (!match) {
      invalidRange(`"${token}" is not a valid page number or range.`);
    }

    const start = Number(match[1]);
    const end = match[2] ? Number(match[2]) : start;
    if (start < 1 || end < 1 || start > totalPages || end > totalPages) {
      invalidRange(
        `"${token}" is outside the available pages 1-${totalPages}.`
      );
    }
    if (start > end) {
      invalidRange(`"${token}" is reversed. Enter the lower page first.`);
    }

    for (let page = start; page <= end; page += 1) selected.add(page);
  }

  return [...selected].sort((a, b) => a - b);
}

export function formatPageRanges(pages: number[]): string {
  const sorted = [...new Set(pages)].sort((a, b) => a - b);
  if (sorted.length === 0) return '';

  const parts: string[] = [];
  let start = sorted[0];
  let end = sorted[0];
  for (const page of sorted.slice(1)) {
    if (page === end + 1) {
      end = page;
      continue;
    }
    parts.push(start === end ? `${start}` : `${start}-${end}`);
    start = page;
    end = page;
  }
  parts.push(start === end ? `${start}` : `${start}-${end}`);
  return parts.join(',');
}
