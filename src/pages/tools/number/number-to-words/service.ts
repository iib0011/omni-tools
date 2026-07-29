export type NumberToWordsOptions = {
  uppercase: boolean;
  includeAnd: boolean;
};

const ONES = [
  '',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen'
];

const TENS = [
  '',
  '',
  'twenty',
  'thirty',
  'forty',
  'fifty',
  'sixty',
  'seventy',
  'eighty',
  'ninety'
];

const SCALES = ['', 'thousand', 'million', 'billion', 'trillion'];

/**
 * Converts a non-negative integer (< 10^15) into its English word form.
 * @param num - the integer to convert
 * @param includeAnd - whether to insert "and" before the tens/ones group (e.g. "one hundred and twenty")
 * @returns the number spelled out in words, or empty string if unconvertible
 */
function integerToWords(num: number, includeAnd: boolean): string {
  if (num === 0) return 'zero';

  const groups: number[] = [];
  let n = num;
  while (n > 0) {
    groups.push(n % 1000);
    n = Math.floor(n / 1000);
  }

  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i -= 1) {
    const group = groups[i];
    if (group === 0) continue;

    const groupWords: string[] = [];

    const hundreds = Math.floor(group / 100);
    const remainder = group % 100;

    if (hundreds > 0) {
      groupWords.push(`${ONES[hundreds]} hundred`);
    }

    if (remainder > 0) {
      const remainderWords =
        remainder < 20
          ? ONES[remainder]
          : TENS[Math.floor(remainder / 10)] +
            (remainder % 10 !== 0 ? `-${ONES[remainder % 10]}` : '');

      if (hundreds > 0 && includeAnd) {
        groupWords.push('and');
      }
      groupWords.push(remainderWords);
    }

    const groupStr = groupWords.join(' ');
    parts.push(i > 0 ? `${groupStr} ${SCALES[i]}` : groupStr);
  }

  return parts.join(' ').trim();
}

/**
 * Converts the fractional part of a number into per-digit words
 * (e.g. 0.42 -> "four two"). This mirrors how cheques/finance spell decimals.
 */
function fractionToWords(fraction: string): string {
  const digits = fraction.replace(/0+$/, '');
  if (digits === '') return '';

  return digits
    .split('')
    .map((d) => ONES[Number(d)])
    .join(' ');
}

/**
 * Converts a single numeric string into its English word representation.
 * Supports negative values and decimal fractions.
 */
function convertSingle(raw: string, options: NumberToWordsOptions): string {
  const trimmed = raw.trim();
  if (trimmed === '') return '';

  const negative = trimmed.startsWith('-');
  let unsigned = negative ? trimmed.slice(1) : trimmed;

  // Normalize edge-case decimal forms: a trailing dot ("5." -> "5") or a
  // leading dot (".25" -> "0.25"). Order matters: strip the trailing dot first
  // so a lone "." becomes "" and is rejected by the validation below.
  if (unsigned.endsWith('.')) unsigned = unsigned.slice(0, -1);
  if (unsigned.startsWith('.')) unsigned = `0${unsigned}`;

  // Validate: integer part required, optional decimal part
  if (!/^\d+(\.\d+)?$/.test(unsigned)) return '';

  const [intPart, fracPart] = unsigned.split('.');
  const intNum = Number(intPart);

  const words: string[] = [];

  if (negative) words.push('negative');

  const intWords = integerToWords(intNum, options.includeAnd);
  if (intWords) words.push(intWords);

  if (fracPart !== undefined) {
    const fracWords = fractionToWords(fracPart);
    if (fracWords) {
      words.push('point');
      words.push(fracWords);
    }
  }

  let result = words.join(' ').trim();
  if (options.uppercase) result = result.toUpperCase();
  return result;
}

/**
 * Converts each line of the input into words. Empty lines are preserved
 * so the output line count matches the input.
 */
export function numberToWords(
  input: string,
  options: NumberToWordsOptions
): string {
  if (!input) return '';

  return input
    .split('\n')
    .map((line) => convertSingle(line, options))
    .join('\n');
}
