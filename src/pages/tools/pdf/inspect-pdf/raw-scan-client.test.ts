import { startRawPdfScan } from './raw-scan-client';
import { RawPdfScan } from './types';

const rawResult: RawPdfScan = {
  sha256: '0'.repeat(64),
  hasPdfHeader: true,
  headerVersion: '1.7',
  headerByteOffset: 0,
  markers: [],
  scannedBytes: 4,
  notes: []
};

class FakeWorker {
  static instances: FakeWorker[] = [];
  onmessage: ((event: MessageEvent<unknown>) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  onmessageerror: (() => void) | null = null;
  messages: unknown[] = [];
  terminated = false;
  response: 'complete' | 'structured-error' | 'none' = 'complete';

  constructor() {
    FakeWorker.instances.push(this);
  }

  postMessage(message: unknown): void {
    this.messages.push(message);
    if (
      this.response === 'none' ||
      !message ||
      typeof message !== 'object' ||
      !('type' in message) ||
      message.type !== 'start' ||
      !('requestId' in message) ||
      typeof message.requestId !== 'string'
    ) {
      return;
    }

    queueMicrotask(() => {
      if (this.response === 'complete') {
        this.onmessage?.(
          new MessageEvent('message', {
            data: {
              type: 'complete',
              requestId: message.requestId,
              result: rawResult
            }
          })
        );
      } else {
        this.onmessage?.(
          new MessageEvent('message', {
            data: {
              type: 'error',
              requestId: message.requestId,
              error: {
                code: 'scan-failed',
                message: 'Structured scan failure',
                details: 'fixture'
              }
            }
          })
        );
      }
    });
  }

  terminate(): void {
    this.terminated = true;
  }
}

describe('raw scan worker client', () => {
  beforeEach(() => {
    FakeWorker.instances = [];
    vi.stubGlobal('Worker', FakeWorker);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolves a matching successful response and terminates the worker', async () => {
    const handle = startRawPdfScan(new ArrayBuffer(4), 'request-success');

    await expect(handle.promise).resolves.toEqual(rawResult);
    expect(FakeWorker.instances[0].terminated).toBe(true);
  });

  it('rejects a structured worker error', async () => {
    const handle = startRawPdfScan(new ArrayBuffer(4), 'request-error');
    FakeWorker.instances[0].response = 'structured-error';

    await expect(handle.promise).rejects.toMatchObject({
      code: 'worker-error',
      message: 'Structured scan failure',
      details: 'fixture'
    });
    expect(FakeWorker.instances[0].terminated).toBe(true);
  });

  it('posts a typed cancel request, rejects, and terminates immediately', async () => {
    const handle = startRawPdfScan(new ArrayBuffer(4), 'request-cancel');
    FakeWorker.instances[0].response = 'none';

    handle.cancel();

    await expect(handle.promise).rejects.toMatchObject({
      code: 'cancelled'
    });
    expect(FakeWorker.instances[0].messages).toContainEqual({
      type: 'cancel',
      requestId: 'request-cancel'
    });
    expect(FakeWorker.instances[0].terminated).toBe(true);
  });
});
