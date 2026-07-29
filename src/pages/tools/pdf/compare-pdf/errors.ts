import { VisualDiffErrorCode } from './types';

export type ComparePdfErrorCode =
  | 'invalid-input'
  | 'pdf-load-failed'
  | 'render-failed'
  | 'text-extraction-failed'
  | 'worker-failed'
  | 'cancelled'
  | 'unknown';

export class ComparePdfError extends Error {
  readonly code: ComparePdfErrorCode;
  readonly pageNumber: number | null;

  constructor(
    code: ComparePdfErrorCode,
    message: string,
    pageNumber: number | null = null,
    options?: ErrorOptions
  ) {
    super(message, options);
    this.name = 'ComparePdfError';
    this.code = code;
    this.pageNumber = pageNumber;
  }
}

export class VisualDiffWorkerError extends Error {
  readonly code: VisualDiffErrorCode;
  readonly pageNumber: number | null;

  constructor(
    code: VisualDiffErrorCode,
    message: string,
    pageNumber: number | null = null,
    options?: ErrorOptions
  ) {
    super(message, options);
    this.name = 'VisualDiffWorkerError';
    this.code = code;
    this.pageNumber = pageNumber;
  }
}

export function createAbortError(message = 'PDF comparison was cancelled.') {
  return new DOMException(message, 'AbortError');
}

export function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error &&
      (error.name === 'AbortError' ||
        (error instanceof ComparePdfError && error.code === 'cancelled')))
  );
}

export function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) {
    throw createAbortError();
  }
}
