/// <reference lib="webworker" />

import type {
  WorkerRequest,
  WorkerResponse
} from '../../../../lib/pdf-workbench/protocol';
import { serializeWorkerFailure } from '../../../../lib/pdf-workbench/protocol';
import { isCancellationError } from '../../../../lib/pdf-workbench/errors';
import { stampPdf } from './service';
import type { StampWorkerPayload, StampWorkerResult } from './types';

const cancelled = new Set<string>();

self.onmessage = async (
  event: MessageEvent<WorkerRequest<StampWorkerPayload>>
) => {
  const request = event.data;
  if (request.type === 'cancel') {
    cancelled.add(request.requestId);
    return;
  }

  const send = (
    response: WorkerResponse<StampWorkerResult>,
    transfer: Transferable[] = []
  ) => self.postMessage(response, { transfer });

  try {
    const result = await stampPdf(
      request.payload,
      (completed, total, pageNumber) =>
        send({
          type: 'progress',
          requestId: request.requestId,
          progress: {
            stage: 'stamping',
            completed,
            total,
            pageNumber
          }
        }),
      () => cancelled.has(request.requestId)
    );
    if (cancelled.has(request.requestId)) {
      send({ type: 'cancelled', requestId: request.requestId });
    } else {
      send({ type: 'result', requestId: request.requestId, result }, [
        result.bytes
      ]);
    }
  } catch (error) {
    if (isCancellationError(error)) {
      send({ type: 'cancelled', requestId: request.requestId });
    } else {
      send({
        type: 'error',
        requestId: request.requestId,
        error: serializeWorkerFailure(error, 'stamping')
      });
    }
  } finally {
    cancelled.delete(request.requestId);
  }
};

export {};
