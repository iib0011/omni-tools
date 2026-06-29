const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export function extractEmails(input: string, unique: boolean): string {
  if (!input) return '';

  const matches = input.match(EMAIL_REGEX);
  if (!matches) return '';

  if (unique) {
    return [...new Set(matches)].join('\n');
  }

  return matches.join('\n');
}
