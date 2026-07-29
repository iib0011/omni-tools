import { isRawScanWorkerResponse, RawScanWorkerRequest } from './protocol';
import { InspectPdfError, InspectionProgress, RawPdfScan } from './types';

export interface RawScanHandle {
  promise: Promise<RawPdfScan>;
  cancel: () => void;
}

export function startRawPdfScan(
  bytes: ArrayBuffer,
  requestId: string,
  onProgress?: (progress: InspectionProgress) => void
): RawScanHandle {
  let worker: Worker;
  try {
    worker = new Worker(new URL('./raw-scan.worker.ts', import.meta.url), {
      type: 'module'
    });
  } catch (error) {
    return {
      promise: Promise.reject(
        new InspectPdfError(
          'worker-error',
          'The inspector worker could not be started.',
          error instanceof Error ? error.message : String(error)
        )
      ),
      cancel: () => {}
    };
  }
  let settled = false;
  let rejectPromise: ((reason: InspectPdfError) => void) | undefined;

  const cleanup = (): void => {
    worker.onmessage = null;
    worker.onerror = null;
    worker.onmessageerror = null;
    worker.terminate();
  };

  const promise = new Promise<RawPdfScan>((resolve, reject) => {
    rejectPromise = reject;
    const rejectOnce = (error: InspectPdfError): void => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      reject(error);
    };

    worker.onmessage = (event: MessageEvent<unknown>) => {
      if (!isRawScanWorkerResponse(event.data)) {
        rejectOnce(
          new InspectPdfError(
            'worker-error',
            'The inspector worker returned an invalid response.'
          )
        );
        return;
      }

      const response = event.data;
      if (settled) {
        return;
      }
      if (response.requestId !== requestId) {
        rejectOnce(
          new InspectPdfError(
            'worker-error',
            'The inspector worker returned a response for the wrong request.'
          )
        );
        return;
      }

      if (response.type === 'progress') {
        onProgress?.({
          stage: response.stage,
          completed: response.completed,
          total: response.total
        });
        return;
      }

      if (response.type === 'complete') {
        settled = true;
        cleanup();
        resolve(response.result);
        return;
      }

      if (response.type === 'cancelled') {
        rejectOnce(
          new InspectPdfError('cancelled', 'PDF inspection was cancelled.')
        );
        return;
      }

      rejectOnce(
        new InspectPdfError(
          'worker-error',
          response.error.message,
          response.error.details
        )
      );
    };

    worker.onerror = (event) => {
      event.preventDefault();
      rejectOnce(
        new InspectPdfError(
          'worker-error',
          'The inspector worker stopped unexpectedly.',
          event.message
        )
      );
    };

    worker.onmessageerror = () => {
      rejectOnce(
        new InspectPdfError(
          'worker-error',
          'The inspector worker could not decode a response.'
        )
      );
    };

    const request: RawScanWorkerRequest = {
      type: 'start',
      requestId,
      bytes
    };
    try {
      worker.postMessage(request, [bytes]);
    } catch (error) {
      rejectOnce(
        new InspectPdfError(
          'worker-error',
          'The PDF bytes could not be sent to the inspector worker.',
          error instanceof Error ? error.message : String(error)
        )
      );
    }
  });

  return {
    promise,
    cancel: () => {
      if (settled) {
        return;
      }

      const request: RawScanWorkerRequest = {
        type: 'cancel',
        requestId
      };
      try {
        worker.postMessage(request);
      } finally {
        settled = true;
        cleanup();
        rejectPromise?.(
          new InspectPdfError('cancelled', 'PDF inspection was cancelled.')
        );
      }
    }
  };
}
