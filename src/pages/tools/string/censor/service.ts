import { InitialValuesType } from './types';

export function censorText(input: string, options: InitialValuesType): string {
  if (!input) return '';
  if (!options.wordsToCensor) return input;

  if (options.censoredBySymbol && !isSymbol(options.censorSymbol)) {
    throw new Error('Enter a valid censor symbol (non-alphanumeric or emoji)');
  }

  const wordsToCensor = options.wordsToCensor
    .split('\n')
    .map((word) => word.trim())
    .filter((word) => word.length > 0);

  let censoredText = input;

  for (const word of wordsToCensor) {
    const escapedWord = escapeRegex(word);
    const pattern = new RegExp(`\\b${escapedWord}\\b`, 'giu');

    const replacement = options.censoredBySymbol
      ? options.eachLetter
        ? options.censorSymbol.repeat(word.length)
        : options.censorSymbol
      : options.censorWord;

    censoredText = censoredText.replace(pattern, replacement);
  }

  return censoredText;
}

/**
 * Escapes RegExp special characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Determines if a string is a valid symbol or emoji (multi-codepoint supported).
 */
function isSymbol(input: string): boolean {
  return (
    /^[^\p{L}\p{N}]+$/u.test(input) || // Not a letter or number
    /\p{Extended_Pictographic}/u.test(input) // Emoji or pictographic symbol
  );
}
