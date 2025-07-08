import { InitialValuesType } from './types';

export function censorText(input: string, options: InitialValuesType): string {
  if (!input) return '';
  if (!options.wordsToCensor) return input;

  if (options.censoredBySymbol && !isSymbol(options.censorSymbol[0])) {
    throw new Error('Enter a valid censor symbol (non-alphanumeric or emoji)');
  }

  // Split text into words and punctuation using Unicode-aware regex
  const regex = /([\s\p{P}])/gu;
  const textWords = input.split(regex);

  // Normalize censor words (trim and lowercase)
  const wordsToCensor = options.wordsToCensor
    .split('\n')
    .map((word) => word.trim().toLowerCase())
    .filter((word) => word.length > 0);

  const censoredText = textWords
    .map((word) => {
      const lowerWord = word.toLowerCase();
      if (wordsToCensor.includes(lowerWord)) {
        if (options.censoredBySymbol) {
          return options.eachLetter
            ? options.censorSymbol.repeat(word.length)
            : options.censorSymbol;
        } else {
          return options.censorWord;
        }
      }
      return word;
    })
    .join('');

  return censoredText;
}

/**
 * Determines if a character is a symbol or emoji.
 * Accepts single characters that are non-letter and non-number,
 * or extended pictographic characters (like emojis).
 */
function isSymbol(input: string): boolean {
  return (
    /^[^\p{L}\p{N}]+$/u.test(input) || /\p{Extended_Pictographic}/u.test(input)
  );
}
