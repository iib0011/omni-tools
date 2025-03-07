export function capitalizeFirstLetter(string: string | undefined) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function isNumber(number: any) {
  return !isNaN(parseFloat(number)) && isFinite(number);
}

export const replaceSpecialCharacters = (str: string) => {
  return str
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f')
    .replace(/\\v/g, '\v');
};

export function reverseString(input: string): string {
  return input.split('').reverse().join('');
}
