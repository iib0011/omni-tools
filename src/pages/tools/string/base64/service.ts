import { Buffer } from 'buffer';

export function base64(input: string, encode: boolean): string {
  return encode
    ? Buffer.from(input, 'utf-8').toString('base64')
    : Buffer.from(input, 'base64').toString('utf-8');
}
