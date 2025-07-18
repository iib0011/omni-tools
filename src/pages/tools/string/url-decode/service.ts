export function decodeString(input: string): string {
  if (!input) return '';

  let result = '';
  let i = 0;

  while (i < input.length) {
    if (input[i] === '%' && i + 2 < input.length) {
      const hex = input.substring(i + 1, i + 3);
      const code = parseInt(hex, 16);
      result += String.fromCodePoint(code);
      i += 3;
    } else {
      result += input[i];
      i++;
    }
  }

  return result;
}
