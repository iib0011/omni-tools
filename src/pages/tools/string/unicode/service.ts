import { InitialValuesType } from './types';

export function unicode(input: string, options: InitialValuesType): string {
  if (!input) return '';
  if (options.mode === 'encode') {
    let result = '';
    for (let i = 0; i < input.length; i++) {
      let hex = input.charCodeAt(i).toString(16);
      hex = ('0000' + hex).slice(-4);
      if (options.uppercase) {
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
