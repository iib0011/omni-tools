import {
  VisualDiffCompareRequest,
  VisualDiffProgressResponse,
  VisualDiffRequest,
  VisualDiffResponse,
  VisualDiffResult
} from './types';
import { VisualDiffWorkerError, createAbortError } from './errors';

export interface WorkerLike {
  onmessage: ((event: MessageEvent<VisualDiffResponse>) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
  onmessageerror: ((event: MessageEvent<unknown>) => void) | null;
  postMessage(message: VisualDiffRequest, transfer?: Transferable[]): void;
  terminate(): void;
}

export type WorkerFactory = () => WorkerLike;

interface PendingComparison {
  pageNumber: number;
  resolve: (result: VisualDiffResult) => void;
  reject: (error: Error) => void;
  onProgress?: (progress: VisualDiffProgressResponse) => void;
}

let fallbackRequestSequence = 0;

export function createVisualDiffRequestId(pageNumber: number): string {
  const randomId = globalThis.crypto?.randomUUID?.();
  if (randomId) {
    return `compare-page-${pageNumber}-${randomId}`;
  }

  fallbackRequestSequence += 1;
  return `compare-page-${pageNumber}-${Date.now()}-${fallbackRequestSequence}`;
}

function createModuleWorker(): WorkerLike {
  return new Worker(new URL('./visual-diff.worker.ts', import.meta.url), {
    type: 'module',
    name: 'compare-pdf-visual-diff'
  });
}

export class VisualDiffWorkerClient {
  private readonly worker: WorkerLike;
  private readonly pending = new Map<string, PendingComparison>();
  private disposed = false;

  constructor(workerFactory: WorkerFactory = createModuleWorker) {
    this.worker = workerFactory();
    this.worker.onmessage = (event) => {
      this.handleMessage(event.data);
    };
    this.worker.onerror = (event) => {
      event.preventDefault?.();
      this.rejectAll(
        new VisualDiffWorkerError(
          'worker-failure',
          event.message || 'The visual comparison worker crashed.'
        )
      );
    };
    this.worker.onmessageerror = () => {
      this.rejectAll(
        new VisualDiffWorkerError(
          'worker-failure',
          'The visual comparison worker returned an unreadable message.'
        )
      );
    };
  }

  compare(
    request: VisualDiffCompareRequest,
    onProgress?: (progress: VisualDiffProgressResponse) => void
  ): Promise<VisualDiffResult> {
    if (this.disposed) {
      return Promise.reject(
        new VisualDiffWorkerError(
          'worker-failure',
          'The visual comparison worker has already been disposed.'
        )
      );
    }
    if (this.pending.has(request.requestId)) {
      return Promise.reject(
        new VisualDiffWorkerError(
          'invalid-request',
          'Visual comparison request IDs must be unique.',
          request.pageNumber
        )
      );
    }

    return new Promise<VisualDiffResult>((resolve, reject) => {
      this.pending.set(request.requestId, {
        pageNumber: request.pageNumber,
        resolve,
        reject,
        onProgress
      });

      try {
        this.worker.postMessage(request, [request.pixelsA, request.pixelsB]);
      } catch (error) {
        this.pending.delete(request.requestId);
        reject(
          new VisualDiffWorkerError(
            'worker-failure',
            'The page pixels could not be sent to the visual comparison worker.',
            request.pageNumber,
            { cause: error }
          )
        );
      }
    });
  }

  cancel(requestId: string): void {
    const pending = this.pending.get(requestId);
    if (!pending) {
      return;
    }

    this.pending.delete(requestId);
    pending.reject(createAbortError());
    try {
      this.worker.postMessage({ type: 'cancel', requestId });
    } catch {
      // The promise is already rejected; disposal will terminate a dead worker.
    }
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    this.worker.terminate();
    this.rejectAll(createAbortError('Visual comparison worker was disposed.'));
    this.worker.onmessage = null;
    this.worker.onerror = null;
    this.worker.onmessageerror = null;
  }

  private handleMessage(message: VisualDiffResponse): void {
    const pending = this.pending.get(message.requestId);
    if (!pending) {
      return;
    }

    if (message.type === 'progress') {
      pending.onProgress?.(message);
      return;
    }

    this.pending.delete(message.requestId);

    if (message.type === 'result') {
      pending.resolve({
        pageNumber: message.pageNumber,
        changedPixels: message.changedPixels,
        totalPixels: message.totalPixels,
        changedPercentage: message.changedPercentage,
        differenceMask: message.differenceMask
      });
      return;
    }

    if (message.type === 'cancelled') {
      pending.reject(createAbortError());
      return;
    }

    pending.reject(
      new VisualDiffWorkerError(
        message.error.code,
        message.error.message,
        message.pageNumber
      )
    );
  }

  private rejectAll(error: Error): void {
    const pendingRequests = Array.from(this.pending.values());
    this.pending.clear();
    pendingRequests.forEach(({ reject }) => {
      reject(error);
    });
  }
}
