import type { SerializedWorkbenchError } from './errors';

export interface WorkbenchProgress {
  stage: string;
  completed: number;
  total: number;
  pageNumber?: number;
  message?: string;
}

export interface WorkerRunRequest<Payload> {
  type: 'run';
  requestId: string;
  payload: Payload;
}

export interface WorkerCancelRequest {
  type: 'cancel';
  requestId: string;
}

export type WorkerRequest<Payload> =
  | WorkerRunRequest<Payload>
  | WorkerCancelRequest;

export interface WorkerProgressResponse {
  type: 'progress';
  requestId: string;
  progress: WorkbenchProgress;
}

export interface WorkerResultResponse<Result> {
  type: 'result';
  requestId: string;
  result: Result;
}

export interface WorkerErrorResponse {
  type: 'error';
  requestId: string;
  error: SerializedWorkbenchError;
}

export interface WorkerCancelledResponse {
  type: 'cancelled';
  requestId: string;
}

export type WorkerResponse<Result> =
  | WorkerProgressResponse
  | WorkerResultResponse<Result>
  | WorkerErrorResponse
  | WorkerCancelledResponse;

export function createRequestId(prefix = 'pdf-workbench'): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function serializeWorkerFailure(
  error: unknown,
  stage: string,
  pageNumber?: number
): SerializedWorkbenchError {
  return {
    code: 'worker-error',
    message: 'The browser worker could not complete this operation.',
    stage,
    pageNumber,
    details: error instanceof Error ? error.message : String(error)
  };
}
