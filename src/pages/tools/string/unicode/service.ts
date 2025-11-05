import { InitialValuesType } from './types';

export function main(input: string, options: InitialValuesType): string {
  return input;
}

export function unicode(
  input: string,
  encode: boolean,
  uppercase: boolean
): string {
  if (encode) {
    let result = '';
    for (let i = 0; i < input.length; i++) {
      let hex = input.charCodeAt(i).toString(16);
      hex = ('0000' + hex).slice(-4);
      if (uppercase) {
        hex = hex.toUpperCase();
      }
      result += '\\u' + hex;
    }
    return result;
  } else {
    return input.replace(/\\u([\dA-Fa-f]{4})/g, (match, grp) => {
      return String.fromCharCode(parseInt(grp, 16));
    });
  }
}
