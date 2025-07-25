import { diffWordsWithSpace } from 'diff';

function escapeHtml(str: string): string {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function compareTextsHtml(textA: string, textB: string): string {
  const diffs = diffWordsWithSpace(textA, textB);

  const html = diffs
    .map((part) => {
      const val = escapeHtml(part.value).replace(/ /g, '&nbsp;');
      if (part.added) {
        return `<span class="diff-added">${val}</span>`;
      }
      if (part.removed) {
        return `<span class="diff-removed">${val}</span>`;
      }
      return `<span>${val}</span>`;
    })
    .join('');

  return `<div class="diff-line">${html}</div>`;
}
