/// <reference lib="webworker" />

import { isCancellationError } from '../../../../lib/pdf-workbench/errors';
import {
  serializeWorkerFailure,
  type WorkerRequest,
  type WorkerResponse
} from '../../../../lib/pdf-workbench/protocol';
import { buildSearchablePdf } from './service';
import type {
  SearchablePdfWorkerPayload,
  SearchablePdfWorkerResult
} from './types';

const cancelled = new Set<string>();

self.onmessage = async (
  event: MessageEvent<WorkerRequest<SearchablePdfWorkerPayload>>
) => {
  const request = event.data;
  if (request.type === 'cancel') {
    cancelled.add(request.requestId);
    return;
  }

  const send = (
    response: WorkerResponse<SearchablePdfWorkerResult>,
    transfer: Transferable[] = []
  ) => self.postMessage(response, transfer);

  try {
    const result = await buildSearchablePdf(
      request.payload,
      (completed, total, pageNumber) =>
        send({
          type: 'progress',
          requestId: request.requestId,
          progress: {
            stage: 'building',
            completed,
            total: Math.max(1, total),
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
        error: serializeWorkerFailure(error, 'building')
      });
    }
  } finally {
    cancelled.delete(request.requestId);
  }
};

export {};
