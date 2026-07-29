import {
  WorkbenchError,
  cancellationError,
  type SerializedWorkbenchError
} from './errors';
import {
  createRequestId,
  type WorkbenchProgress,
  type WorkerRequest,
  type WorkerResponse
} from './protocol';

export interface WorkerLike {
  onmessage: ((event: MessageEvent) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
  onmessageerror: ((event: MessageEvent) => void) | null;
  postMessage(message: unknown, transfer?: Transferable[]): void;
  terminate(): void;
}

export interface WorkerRunOptions {
  transfer?: Transferable[];
  signal?: AbortSignal;
  onProgress?: (progress: WorkbenchProgress) => void;
}

type Pending<Result> = {
  resolve: (result: Result) => void;
  reject: (error: WorkbenchError) => void;
  onProgress?: (progress: WorkbenchProgress) => void;
  removeAbort?: () => void;
};

export class WorkbenchWorkerClient<Payload, Result> {
  private worker: WorkerLike | null = null;
  private readonly pending = new Map<string, Pending<Result>>();

  constructor(private readonly createWorker: () => WorkerLike) {}

  run(payload: Payload, options: WorkerRunOptions = {}): Promise<Result> {
    if (options.signal?.aborted) {
      return Promise.reject(cancellationError());
    }

    const requestId = createRequestId();
    const worker = this.ensureWorker();

    return new Promise<Result>((resolve, reject) => {
      const pending: Pending<Result> = {
        resolve,
        reject,
        onProgress: options.onProgress
      };

      if (options.signal) {
        const onAbort = () => this.cancel(requestId);
        options.signal.addEventListener('abort', onAbort, { once: true });
        pending.removeAbort = () =>
          options.signal?.removeEventListener('abort', onAbort);
      }

      this.pending.set(requestId, pending);
      const message: WorkerRequest<Payload> = {
        type: 'run',
        requestId,
        payload
      };
      try {
        worker.postMessage(message, options.transfer);
      } catch (error) {
        this.rejectAll({
          code: 'worker-error',
          message: 'The browser could not start the PDF worker request.',
          details: error instanceof Error ? error.message : String(error)
        });
        worker.terminate();
        if (this.worker === worker) this.worker = null;
      }
    });
  }

  cancel(requestId?: string): void {
    if (!this.worker) return;

    const ids = requestId ? [requestId] : [...this.pending.keys()];
    for (const id of ids) {
      const request: WorkerRequest<Payload> = {
        type: 'cancel',
        requestId: id
      };
      this.worker.postMessage(request);
      this.rejectPending(id, cancellationError());
    }

    // Termination is intentional: it stops synchronous WASM/render work too.
    this.worker.terminate();
    this.worker = null;
  }

  dispose(): void {
    this.cancel();
  }

  private ensureWorker(): WorkerLike {
    if (this.worker) return this.worker;

    const worker = this.createWorker();
    worker.onmessage = (event: MessageEvent<WorkerResponse<Result>>) => {
      const message = event.data;
      const pending = this.pending.get(message.requestId);
      if (!pending) return;

      if (message.type === 'progress') {
        pending.onProgress?.(message.progress);
        return;
      }
      if (message.type === 'result') {
        this.resolvePending(message.requestId, message.result);
        return;
      }
      if (message.type === 'cancelled') {
        this.rejectPending(message.requestId, cancellationError());
        return;
      }
      this.rejectPending(message.requestId, new WorkbenchError(message.error));
    };
    worker.onerror = (event: ErrorEvent) => {
      this.rejectAll({
        code: 'worker-error',
        message: 'A browser worker stopped unexpectedly.',
        details: event.message
      });
      worker.terminate();
      this.worker = null;
    };
    worker.onmessageerror = () => {
      this.rejectAll({
        code: 'worker-error',
        message: 'A browser worker returned an unreadable response.'
      });
      worker.terminate();
      this.worker = null;
    };
    this.worker = worker;
    return worker;
  }

  private resolvePending(requestId: string, result: Result): void {
    const pending = this.pending.get(requestId);
    if (!pending) return;
    pending.removeAbort?.();
    this.pending.delete(requestId);
    pending.resolve(result);
  }

  private rejectPending(requestId: string, error: WorkbenchError): void {
    const pending = this.pending.get(requestId);
    if (!pending) return;
    pending.removeAbort?.();
    this.pending.delete(requestId);
    pending.reject(error);
  }

  private rejectAll(error: SerializedWorkbenchError): void {
    const failure = new WorkbenchError(error);
    for (const requestId of [...this.pending.keys()]) {
      this.rejectPending(requestId, failure);
    }
  }
}
