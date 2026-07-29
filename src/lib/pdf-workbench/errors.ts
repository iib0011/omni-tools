export type WorkbenchErrorCode =
  | 'invalid-input'
  | 'invalid-page-range'
  | 'password-required'
  | 'cancelled'
  | 'worker-error'
  | 'pdf-load-failed'
  | 'output-verification-failed'
  | 'unsupported'
  | 'save-failed'
  | 'processing-failed';

export interface SerializedWorkbenchError {
  code: WorkbenchErrorCode;
  message: string;
  stage?: string;
  pageNumber?: number;
  details?: string;
}

export class WorkbenchError extends Error {
  readonly code: WorkbenchErrorCode;
  readonly stage?: string;
  readonly pageNumber?: number;
  readonly details?: string;

  constructor({
    code,
    message,
    stage,
    pageNumber,
    details
  }: SerializedWorkbenchError) {
    super(message);
    this.name = 'WorkbenchError';
    this.code = code;
    this.stage = stage;
    this.pageNumber = pageNumber;
    this.details = details;
  }

  serialize(): SerializedWorkbenchError {
    return {
      code: this.code,
      message: this.message,
      stage: this.stage,
      pageNumber: this.pageNumber,
      details: this.details
    };
  }
}

export const cancellationError = (): WorkbenchError =>
  new WorkbenchError({
    code: 'cancelled',
    message: 'The operation was cancelled.'
  });

export function isCancellationError(error: unknown): boolean {
  return (
    (error instanceof WorkbenchError && error.code === 'cancelled') ||
    (error instanceof DOMException && error.name === 'AbortError')
  );
}

export function toWorkbenchError(
  error: unknown,
  fallback: Omit<SerializedWorkbenchError, 'details'>
): WorkbenchError {
  if (error instanceof WorkbenchError) return error;
  if (error instanceof DOMException && error.name === 'AbortError') {
    return cancellationError();
  }

  return new WorkbenchError({
    ...fallback,
    details: error instanceof Error ? error.message : String(error)
  });
}

export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw cancellationError();
}
