/// <reference lib="webworker" />

import { RawScanWorkerRequest, RawScanWorkerResponse } from './protocol';
import { RawScanCancelledError, scanPdfBytes } from './raw-scan';

const workerScope = self as unknown as DedicatedWorkerGlobalScope;
const cancelledRequests = new Set<string>();

function post(response: RawScanWorkerResponse): void {
  workerScope.postMessage(response);
}

async function handleStart(
  message: Extract<RawScanWorkerRequest, { type: 'start' }>
): Promise<void> {
  try {
    const result = await scanPdfBytes(message.bytes, {
      isCancelled: () => cancelledRequests.has(message.requestId),
      onProgress: (stage, completed, total) => {
        post({
          type: 'progress',
          requestId: message.requestId,
          stage,
          completed,
          total
        });
      }
    });

    if (cancelledRequests.has(message.requestId)) {
      post({ type: 'cancelled', requestId: message.requestId });
      return;
    }

    post({
      type: 'complete',
      requestId: message.requestId,
      result
    });
  } catch (error) {
    if (error instanceof RawScanCancelledError) {
      post({ type: 'cancelled', requestId: message.requestId });
      return;
    }

    post({
      type: 'error',
      requestId: message.requestId,
      error: {
        code: 'scan-failed',
        message: 'The raw PDF scan failed.',
        details: error instanceof Error ? error.message : String(error)
      }
    });
  } finally {
    cancelledRequests.delete(message.requestId);
  }
}

workerScope.addEventListener(
  'message',
  (event: MessageEvent<RawScanWorkerRequest>) => {
    const message = event.data;
    if (
      !message ||
      typeof message.requestId !== 'string' ||
      !message.requestId
    ) {
      post({
        type: 'error',
        requestId: 'unknown',
        error: {
          code: 'invalid-request',
          message: 'The raw scan worker received an invalid request.'
        }
      });
      return;
    }

    if (message.type === 'cancel') {
      cancelledRequests.add(message.requestId);
      return;
    }

    if (message.type === 'start' && message.bytes instanceof ArrayBuffer) {
      void handleStart(message);
      return;
    }

    post({
      type: 'error',
      requestId: message.requestId,
      error: {
        code: 'invalid-request',
        message: 'The raw scan worker received an unsupported request.'
      }
    });
  }
);
