import type { InitialValuesType } from './initialValues';

function getSecureRandomIndex(max: number): number {
  const randomValue = new Uint32Array(1);
  const maxUnbiasedValue = Math.floor(0x100000000 / max) * max;

  do {
    globalThis.crypto.getRandomValues(randomValue);
  } while (randomValue[0] >= maxUnbiasedValue);

  return randomValue[0] % max;
}

export function generatePassword(options: InitialValuesType): string {
  const length = parseInt(options.length || '', 10);
  if (isNaN(length) || length <= 0) {
    return '';
  }

  let charset = '';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

  if (options.includeLowercase) charset += lower;
  if (options.includeUppercase) charset += upper;
  if (options.includeNumbers) charset += numbers;
  if (options.includeSymbols) charset += symbols;

  if (options.avoidAmbiguous) {
    // ambiguous set = i, I, l, 0, O
    const ambig = new Set(['i', 'I', 'l', '0', 'O']);
    charset = Array.from(charset)
      .filter((c) => !ambig.has(c))
      .join('');
  }

  if (!charset) {
    return ''; // nothing to pick from
  }

  let pwd = '';
  for (let i = 0; i < length; i++) {
    const idx = getSecureRandomIndex(charset.length);
    pwd += charset[idx];
  }
  return pwd;
}
