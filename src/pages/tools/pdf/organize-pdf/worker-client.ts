import {
  OrganizerErrorPayload,
  OrganizerExportResult,
  OrganizerInspection,
  OrganizerPage,
  OrganizerProgress,
  OrganizerWorkerRequest,
  OrganizerWorkerResponse
} from './types';

export interface OrganizerWorkerPort {
  onmessage: ((event: MessageEvent<OrganizerWorkerResponse>) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
  onmessageerror: ((event: MessageEvent<unknown>) => void) | null;
  postMessage(message: OrganizerWorkerRequest, transfer: Transferable[]): void;
  terminate(): void;
}

export type OrganizerWorkerFactory = () => OrganizerWorkerPort;
type ProgressCallback = (progress: OrganizerProgress) => void;

export class OrganizerWorkerError extends Error {
  constructor(readonly payload: OrganizerErrorPayload) {
    super(payload.message);
    this.name = 'OrganizerWorkerError';
  }
}

export class OrganizerCancelledError extends Error {
  constructor() {
    super('The operation was cancelled.');
    this.name = 'AbortError';
  }
}

interface ActiveRequest {
  requestId: string;
  worker: OrganizerWorkerPort;
  reject: (error: Error) => void;
}

const defaultWorkerFactory: OrganizerWorkerFactory = () =>
  new Worker(new URL('./organize.worker.ts', import.meta.url), {
    type: 'module',
    name: 'organize-pdf'
  });

const createRequestId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `organize-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export class OrganizerWorkerClient {
  private activeRequest: ActiveRequest | null = null;

  constructor(
    private readonly workerFactory: OrganizerWorkerFactory = defaultWorkerFactory
  ) {}

  inspect(
    source: ArrayBuffer,
    onProgress?: ProgressCallback
  ): Promise<OrganizerInspection> {
    return this.run<OrganizerInspection>(
      {
        type: 'inspect',
        requestId: createRequestId(),
        source
      },
      source,
      'inspected',
      (response) =>
        response.type === 'inspected' ? response.inspection : undefined,
      onProgress
    );
  }

  export(
    source: ArrayBuffer,
    pages: readonly OrganizerPage[],
    onProgress?: ProgressCallback
  ): Promise<OrganizerExportResult> {
    return this.run<OrganizerExportResult>(
      {
        type: 'export',
        requestId: createRequestId(),
        source,
        pages: pages.map((page) => ({ ...page }))
      },
      source,
      'exported',
      (response) =>
        response.type === 'exported' ? response.result : undefined,
      onProgress
    );
  }

  cancel(): void {
    const active = this.activeRequest;
    if (!active) return;
    this.activeRequest = null;
    active.worker.terminate();
    active.reject(new OrganizerCancelledError());
  }

  dispose(): void {
    this.cancel();
  }

  private run<Result>(
    request: OrganizerWorkerRequest,
    source: ArrayBuffer,
    expectedType: 'inspected' | 'exported',
    getResult: (response: OrganizerWorkerResponse) => Result | undefined,
    onProgress?: ProgressCallback
  ): Promise<Result> {
    this.cancel();
    const worker = this.workerFactory();

    return new Promise<Result>((resolve, reject) => {
      let settled = false;
      const cleanup = () => {
        if (settled) return;
        settled = true;
        if (this.activeRequest?.requestId === request.requestId) {
          this.activeRequest = null;
        }
        worker.terminate();
      };
      const succeed = (result: Result) => {
        if (settled) return;
        cleanup();
        resolve(result);
      };
      const fail = (error: Error) => {
        if (settled) return;
        cleanup();
        reject(error);
      };

      this.activeRequest = {
        requestId: request.requestId,
        worker,
        reject: fail
      };

      worker.onmessage = (event: MessageEvent<OrganizerWorkerResponse>) => {
        const response = event.data;
        if (response.requestId !== request.requestId) return;

        if (response.type === 'progress') {
          onProgress?.(response.progress);
          return;
        }
        if (response.type === 'error') {
          fail(new OrganizerWorkerError(response.error));
          return;
        }
        if (response.type !== expectedType) {
          fail(
            new OrganizerWorkerError({
              code: 'WORKER_ERROR',
              message: 'The PDF worker returned an unexpected response.'
            })
          );
          return;
        }

        const result = getResult(response);
        if (result === undefined) {
          fail(
            new OrganizerWorkerError({
              code: 'WORKER_ERROR',
              message: 'The PDF worker returned an incomplete result.'
            })
          );
          return;
        }
        succeed(result);
      };

      worker.onerror = (event) => {
        event.preventDefault();
        fail(
          new OrganizerWorkerError({
            code: 'WORKER_ERROR',
            message: event.message || 'The PDF worker failed.'
          })
        );
      };

      worker.onmessageerror = () => {
        fail(
          new OrganizerWorkerError({
            code: 'WORKER_ERROR',
            message: 'The PDF worker returned unreadable data.'
          })
        );
      };

      try {
        worker.postMessage(request, [source]);
      } catch (error) {
        fail(
          error instanceof Error
            ? error
            : new Error('The PDF worker request could not be sent.')
        );
      }
    });
  }
}
