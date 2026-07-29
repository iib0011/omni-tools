import { RawPdfScan } from './types';

export interface RawScanStartRequest {
  type: 'start';
  requestId: string;
  bytes: ArrayBuffer;
}

export interface RawScanCancelRequest {
  type: 'cancel';
  requestId: string;
}

export type RawScanWorkerRequest = RawScanStartRequest | RawScanCancelRequest;

export interface RawScanProgressResponse {
  type: 'progress';
  requestId: string;
  stage: 'hashing' | 'scanning-structure';
  completed: number;
  total: number;
}

export interface RawScanCompleteResponse {
  type: 'complete';
  requestId: string;
  result: RawPdfScan;
}

export interface RawScanCancelledResponse {
  type: 'cancelled';
  requestId: string;
}

export interface RawScanErrorResponse {
  type: 'error';
  requestId: string;
  error: {
    code: 'invalid-request' | 'hash-failed' | 'scan-failed';
    message: string;
    details?: string;
  };
}

export type RawScanWorkerResponse =
  | RawScanProgressResponse
  | RawScanCompleteResponse
  | RawScanCancelledResponse
  | RawScanErrorResponse;

export function isRawScanWorkerResponse(
  value: unknown
): value is RawScanWorkerResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as {
    type?: unknown;
    requestId?: unknown;
  };

  return (
    typeof candidate.requestId === 'string' &&
    candidate.requestId.length > 0 &&
    (candidate.type === 'progress' ||
      candidate.type === 'complete' ||
      candidate.type === 'cancelled' ||
      candidate.type === 'error')
  );
}
