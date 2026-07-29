import { describe, expect, it, vi } from 'vitest';
import { OrganizerWorkerClient, OrganizerWorkerPort } from './worker-client';
import { OrganizerWorkerRequest, OrganizerWorkerResponse } from './types';

class FakeWorker implements OrganizerWorkerPort {
  onmessage: ((event: MessageEvent<OrganizerWorkerResponse>) => void) | null =
    null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  onmessageerror: ((event: MessageEvent<unknown>) => void) | null = null;
  terminated = false;
  terminateCalls = 0;
  postedRequest: OrganizerWorkerRequest | null = null;
  transferred: Transferable[] = [];

  constructor(
    private readonly respond?: (
      request: OrganizerWorkerRequest,
      worker: FakeWorker
    ) => void
  ) {}

  postMessage(request: OrganizerWorkerRequest, transfer: Transferable[]): void {
    this.postedRequest = request;
    this.transferred = transfer;
    this.respond?.(request, this);
  }

  terminate(): void {
    this.terminated = true;
    this.terminateCalls += 1;
  }

  emit(response: OrganizerWorkerResponse): void {
    this.onmessage?.(
      new MessageEvent<OrganizerWorkerResponse>('message', {
        data: response
      })
    );
  }
}

describe('organize-pdf worker client', () => {
  it('handles progress and a successful inspection response', async () => {
    const progress = vi.fn();
    const worker = new FakeWorker((request, currentWorker) => {
      queueMicrotask(() => {
        currentWorker.emit({
          type: 'progress',
          requestId: request.requestId,
          progress: { stage: 'reading', current: 1, total: 1 }
        });
        currentWorker.emit({
          type: 'inspected',
          requestId: request.requestId,
          inspection: {
            pages: [],
            pageCount: 0,
            hasSignatureFields: false
          }
        });
      });
    });
    const client = new OrganizerWorkerClient(() => worker);
    const source = new ArrayBuffer(8);

    await expect(client.inspect(source, progress)).resolves.toMatchObject({
      pageCount: 0
    });
    expect(progress).toHaveBeenCalledWith({
      stage: 'reading',
      current: 1,
      total: 1
    });
    expect(worker.transferred).toEqual([source]);
    expect(worker.terminated).toBe(true);
  });

  it('turns structured worker failures into errors', async () => {
    const worker = new FakeWorker((request, currentWorker) => {
      queueMicrotask(() =>
        currentWorker.emit({
          type: 'error',
          requestId: request.requestId,
          error: {
            code: 'INVALID_PDF',
            message: 'Invalid fixture'
          }
        })
      );
    });
    const client = new OrganizerWorkerClient(() => worker);

    await expect(client.inspect(new ArrayBuffer(4))).rejects.toMatchObject({
      name: 'OrganizerWorkerError',
      message: 'Invalid fixture',
      payload: { code: 'INVALID_PDF' }
    });
    expect(worker.terminated).toBe(true);
  });

  it('terminates the worker and rejects when cancelled', async () => {
    const worker = new FakeWorker();
    const client = new OrganizerWorkerClient(() => worker);
    const pending = client.inspect(new ArrayBuffer(4));

    client.cancel();

    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    expect(worker.terminated).toBe(true);
  });

  it('cleans up when posting the worker request throws synchronously', async () => {
    const worker = new FakeWorker();
    worker.postMessage = () => {
      throw new DOMException(
        'The source could not be cloned.',
        'DataCloneError'
      );
    };
    const client = new OrganizerWorkerClient(() => worker);

    await expect(client.inspect(new ArrayBuffer(4))).rejects.toMatchObject({
      name: 'DataCloneError',
      message: 'The source could not be cloned.'
    });
    expect(worker.terminateCalls).toBe(1);

    client.cancel();
    expect(worker.terminateCalls).toBe(1);
  });
});
