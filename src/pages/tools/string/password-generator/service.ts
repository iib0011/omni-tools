import type { InitialValuesType } from './initialValues';

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

const AMBIGUOUS = new Set(['i', 'I', 'l', '0', 'O']);

const MAX_PASSWORD_LENGTH = 256;

function randomChar(chars: string): string {
  const array = new Uint32Array(1);
  globalThis.crypto.getRandomValues(array);

  return chars[array[0] % chars.length];
}

function shuffle(array: string[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const random = new Uint32Array(1);
    globalThis.crypto.getRandomValues(random);

    const j = random[0] % (i + 1);

    [array[i], array[j]] = [array[j], array[i]];
  }
}

function removeAmbiguous(chars: string): string {
  return [...chars].filter((char) => !AMBIGUOUS.has(char)).join('');
}

export function generatePassword(options: InitialValuesType): string {
  const length = Number.parseInt(options.length || '', 10);

  if (Number.isNaN(length) || length <= 0 || length > MAX_PASSWORD_LENGTH) {
    return '';
  }

  let pools = [
    options.includeLowercase ? LOWERCASE : '',
    options.includeUppercase ? UPPERCASE : '',
    options.includeNumbers ? NUMBERS : '',
    options.includeSymbols ? SYMBOLS : ''
  ].filter(Boolean);

  if (options.avoidAmbiguous) {
    pools = pools.map(removeAmbiguous);
  }

  // Remove empty pools after filtering
  pools = pools.filter(Boolean);

  if (pools.length === 0 || length < pools.length) {
    return '';
  }

  const password: string[] = [];

  // Guarantee each selected category appears once
  for (const pool of pools) {
    password.push(randomChar(pool));
  }

  const charset = pools.join('');

  while (password.length < length) {
    password.push(randomChar(charset));
  }

  shuffle(password);

  return password.join('');
}
