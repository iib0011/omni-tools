import { TranslatorErrorCode } from './types';

/**
 * Error raised by the translator. `code` identifies the failure category;
 * `details` holds an engine-provided message, if any, shown as extra detail.
 */
export class TranslatorError extends Error {
  readonly code: TranslatorErrorCode;
  readonly details?: string;

  constructor(code: TranslatorErrorCode, details?: string) {
    super(details || code);
    this.name = 'TranslatorError';
    this.code = code;
    this.details = details;
  }
}

export const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === 'AbortError';

export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new DOMException('The operation was aborted.', 'AbortError');
  }
}
