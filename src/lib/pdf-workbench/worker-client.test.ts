import { describe, expect, it, vi } from 'vitest';
import type { WorkerResponse } from './protocol';
import { WorkbenchWorkerClient, type WorkerLike } from './worker-client';

class FakeWorker<Result> implements WorkerLike {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  onmessageerror: ((event: MessageEvent) => void) | null = null;
  readonly postMessage = vi.fn();
  readonly terminate = vi.fn();

  respond(message: WorkerResponse<Result>): void {
    this.onmessage?.({ data: message } as MessageEvent);
  }
}

describe('WorkbenchWorkerClient', () => {
  it('routes progress and a successful result by unique request ID', async () => {
    const worker = new FakeWorker<{ value: number }>();
    const onProgress = vi.fn();
    const client = new WorkbenchWorkerClient<
      { input: number },
      { value: number }
    >(() => worker);
    const pending = client.run({ input: 2 }, { onProgress, transfer: [] });
    const request = worker.postMessage.mock.calls[0][0] as {
      requestId: string;
    };

    worker.respond({
      type: 'progress',
      requestId: request.requestId,
      progress: { stage: 'working', completed: 1, total: 2 }
    });
    worker.respond({
      type: 'result',
      requestId: request.requestId,
      result: { value: 4 }
    });

    await expect(pending).resolves.toEqual({ value: 4 });
    expect(onProgress).toHaveBeenCalledWith({
      stage: 'working',
      completed: 1,
      total: 2
    });
    expect(request.requestId).toMatch(/^pdf-workbench-/u);
  });

  it('surfaces structured worker errors', async () => {
    const worker = new FakeWorker<never>();
    const client = new WorkbenchWorkerClient<object, never>(() => worker);
    const pending = client.run({});
    const requestId = worker.postMessage.mock.calls[0][0].requestId as string;
    worker.respond({
      type: 'error',
      requestId,
      error: {
        code: 'worker-error',
        message: 'Known worker failure',
        stage: 'fixture'
      }
    });
    await expect(pending).rejects.toMatchObject({
      code: 'worker-error',
      message: 'Known worker failure',
      stage: 'fixture'
    });
  });

  it('posts cancellation, rejects the request, and terminates real work', async () => {
    const worker = new FakeWorker<never>();
    const client = new WorkbenchWorkerClient<object, never>(() => worker);
    const controller = new AbortController();
    const pending = client.run({}, { signal: controller.signal });
    const requestId = worker.postMessage.mock.calls[0][0].requestId as string;

    controller.abort();

    await expect(pending).rejects.toMatchObject({ code: 'cancelled' });
    expect(worker.postMessage).toHaveBeenCalledWith({
      type: 'cancel',
      requestId
    });
    expect(worker.terminate).toHaveBeenCalledOnce();
  });

  it('does not create or post to a worker for a pre-aborted request', async () => {
    const worker = new FakeWorker<never>();
    const createWorker = vi.fn(() => worker);
    const client = new WorkbenchWorkerClient<object, never>(createWorker);
    const controller = new AbortController();
    controller.abort();

    await expect(
      client.run({}, { signal: controller.signal })
    ).rejects.toMatchObject({ code: 'cancelled' });
    expect(createWorker).not.toHaveBeenCalled();
    expect(worker.postMessage).not.toHaveBeenCalled();
  });

  it('rejects pending work on message decoding failures', async () => {
    const worker = new FakeWorker<never>();
    const client = new WorkbenchWorkerClient<object, never>(() => worker);
    const pending = client.run({});
    worker.onmessageerror?.({} as MessageEvent);
    await expect(pending).rejects.toMatchObject({ code: 'worker-error' });
    expect(worker.terminate).toHaveBeenCalledOnce();
  });

  it('cleans up when posting a worker request throws synchronously', async () => {
    const worker = new FakeWorker<never>();
    worker.postMessage.mockImplementation(() => {
      throw new DOMException('Transfer failed', 'DataCloneError');
    });
    const client = new WorkbenchWorkerClient<object, never>(() => worker);

    await expect(client.run({}, { transfer: [] })).rejects.toMatchObject({
      code: 'worker-error',
      message: 'The browser could not start the PDF worker request.',
      details: 'Transfer failed'
    });
    expect(worker.terminate).toHaveBeenCalledOnce();

    client.dispose();
    expect(worker.terminate).toHaveBeenCalledOnce();
  });
});
