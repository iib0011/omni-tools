import { describe, expect, it, vi } from 'vitest';
import {
  VisualDiffWorkerClient,
  WorkerLike,
  createVisualDiffRequestId
} from './worker-client';
import {
  VisualDiffCompareRequest,
  VisualDiffRequest,
  VisualDiffResponse
} from './types';
import { VisualDiffWorkerError } from './errors';

class FakeWorker implements WorkerLike {
  onmessage: ((event: MessageEvent<VisualDiffResponse>) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  onmessageerror: ((event: MessageEvent<unknown>) => void) | null = null;
  readonly messages: VisualDiffRequest[] = [];
  readonly terminate = vi.fn();

  postMessage(message: VisualDiffRequest): void {
    this.messages.push(message);
  }

  emit(message: VisualDiffResponse): void {
    this.onmessage?.(new MessageEvent('message', { data: message }));
  }
}

function request(requestId = 'request-1'): VisualDiffCompareRequest {
  return {
    type: 'compare',
    requestId,
    pageNumber: 3,
    width: 1,
    height: 1,
    tolerance: 8,
    pixelsA: new ArrayBuffer(4),
    pixelsB: new ArrayBuffer(4)
  };
}

describe('VisualDiffWorkerClient', () => {
  it('forwards progress and resolves a typed result', async () => {
    const worker = new FakeWorker();
    const client = new VisualDiffWorkerClient(() => worker);
    const onProgress = vi.fn();
    const pending = client.compare(request(), onProgress);

    worker.emit({
      type: 'progress',
      requestId: 'request-1',
      pageNumber: 3,
      completedRows: 1,
      totalRows: 2,
      percent: 50
    });
    const differenceMask = new ArrayBuffer(4);
    worker.emit({
      type: 'result',
      requestId: 'request-1',
      pageNumber: 3,
      changedPixels: 1,
      totalPixels: 1,
      changedPercentage: 100,
      differenceMask
    });

    await expect(pending).resolves.toEqual({
      pageNumber: 3,
      changedPixels: 1,
      totalPixels: 1,
      changedPercentage: 100,
      differenceMask
    });
    expect(onProgress).toHaveBeenCalledWith(
      expect.objectContaining({ percent: 50 })
    );
    expect(worker.messages[0]).toMatchObject({
      type: 'compare',
      requestId: 'request-1'
    });
    client.dispose();
  });

  it('rejects structured errors returned by the worker', async () => {
    const worker = new FakeWorker();
    const client = new VisualDiffWorkerClient(() => worker);
    const pending = client.compare(request());

    worker.emit({
      type: 'error',
      requestId: 'request-1',
      pageNumber: 3,
      error: {
        code: 'invalid-pixel-buffer',
        message: 'The RGBA buffers do not match.'
      }
    });

    await expect(pending).rejects.toMatchObject({
      name: 'VisualDiffWorkerError',
      code: 'invalid-pixel-buffer',
      pageNumber: 3
    });
    client.dispose();
  });

  it('posts a cancellation request and rejects immediately', async () => {
    const worker = new FakeWorker();
    const client = new VisualDiffWorkerClient(() => worker);
    const pending = client.compare(request());

    client.cancel('request-1');

    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    expect(worker.messages[1]).toEqual({
      type: 'cancel',
      requestId: 'request-1'
    });
    client.dispose();
  });

  it('rejects pending work on worker errors and message errors', async () => {
    const crashingWorker = new FakeWorker();
    const crashingClient = new VisualDiffWorkerClient(() => crashingWorker);
    const crashed = crashingClient.compare(request('crash'));
    crashingWorker.onerror?.(
      new ErrorEvent('error', { message: 'worker crashed' })
    );

    await expect(crashed).rejects.toBeInstanceOf(VisualDiffWorkerError);
    crashingClient.dispose();

    const unreadableWorker = new FakeWorker();
    const unreadableClient = new VisualDiffWorkerClient(() => unreadableWorker);
    const unreadable = unreadableClient.compare(request('unreadable'));
    unreadableWorker.onmessageerror?.(
      new MessageEvent('messageerror', { data: null })
    );

    await expect(unreadable).rejects.toMatchObject({
      name: 'VisualDiffWorkerError',
      code: 'worker-failure'
    });
    unreadableClient.dispose();
  });

  it('terminates the worker and rejects pending work during disposal', async () => {
    const worker = new FakeWorker();
    const client = new VisualDiffWorkerClient(() => worker);
    const pending = client.compare(request());

    client.dispose();

    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    expect(worker.terminate).toHaveBeenCalledOnce();
    await expect(client.compare(request('late'))).rejects.toMatchObject({
      code: 'worker-failure'
    });
  });

  it('creates unique request IDs that retain the page number', () => {
    const first = createVisualDiffRequestId(4);
    const second = createVisualDiffRequestId(4);

    expect(first).not.toBe(second);
    expect(first).toContain('compare-page-4-');
    expect(second).toContain('compare-page-4-');
  });
});
