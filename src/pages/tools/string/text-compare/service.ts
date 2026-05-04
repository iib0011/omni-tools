import { diffWordsWithSpace, diffChars } from 'diff';
import { level } from './types';
import { escapeHtml } from 'utils/string';

const DIFF_FN = {
  word: diffWordsWithSpace,
  char: diffChars
} as const;

export function compareTextsHtml(
  textA: string,
  textB: string,
  level: level
): string {
  const diffs = DIFF_FN[level](textA, textB);

  const html = diffs
    .map((part) => {
      const val = escapeHtml(part.value).replace(/\n/g, '<br>');
      if (part.added) {
        return `<span class="diff-added">${val}</span>`;
      }
      if (part.removed) {
        return `<span class="diff-removed">${val}</span>`;
      }
      return val;
    })
    .join('');

  return `<div class="diff-line">${html}</div>`;
}
