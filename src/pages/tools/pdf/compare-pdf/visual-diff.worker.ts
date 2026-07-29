import {
  InvalidPixelBufferError,
  PixelComparisonCancelledError,
  comparePixelBuffers
} from './visual-diff';
import {
  VisualDiffCompareRequest,
  VisualDiffRequest,
  VisualDiffResponse
} from './types';

interface VisualDiffWorkerScope {
  onmessage: ((event: MessageEvent<VisualDiffRequest>) => void) | null;
  postMessage(message: VisualDiffResponse, transfer?: Transferable[]): void;
}

const workerScope = self as unknown as VisualDiffWorkerScope;
const cancelledRequestIds = new Set<string>();
const activeRequestIds = new Set<string>();

function post(message: VisualDiffResponse, transfer?: Transferable[]): void {
  workerScope.postMessage(message, transfer);
}

async function handleComparison(
  request: VisualDiffCompareRequest
): Promise<void> {
  if (activeRequestIds.has(request.requestId)) {
    post({
      type: 'error',
      requestId: request.requestId,
      pageNumber: request.pageNumber,
      error: {
        code: 'invalid-request',
        message: 'A visual comparison with this request ID is already active.'
      }
    });
    return;
  }

  activeRequestIds.add(request.requestId);

  try {
    const result = await comparePixelBuffers(
      {
        pixelsA: new Uint8ClampedArray(request.pixelsA),
        pixelsB: new Uint8ClampedArray(request.pixelsB),
        width: request.width,
        height: request.height,
        tolerance: request.tolerance
      },
      {
        shouldCancel: () => cancelledRequestIds.has(request.requestId),
        onProgress: (completedRows, totalRows) => {
          post({
            type: 'progress',
            requestId: request.requestId,
            pageNumber: request.pageNumber,
            completedRows,
            totalRows,
            percent: totalRows === 0 ? 0 : (completedRows / totalRows) * 100
          });
        }
      }
    );

    if (cancelledRequestIds.has(request.requestId)) {
      post({
        type: 'cancelled',
        requestId: request.requestId,
        pageNumber: request.pageNumber
      });
      return;
    }

    const differenceMask = new ArrayBuffer(result.differenceMask.byteLength);
    new Uint8ClampedArray(differenceMask).set(result.differenceMask);
    post(
      {
        type: 'result',
        requestId: request.requestId,
        pageNumber: request.pageNumber,
        changedPixels: result.changedPixels,
        totalPixels: result.totalPixels,
        changedPercentage: result.changedPercentage,
        differenceMask
      },
      [differenceMask]
    );
  } catch (error) {
    if (
      error instanceof PixelComparisonCancelledError ||
      cancelledRequestIds.has(request.requestId)
    ) {
      post({
        type: 'cancelled',
        requestId: request.requestId,
        pageNumber: request.pageNumber
      });
      return;
    }

    post({
      type: 'error',
      requestId: request.requestId,
      pageNumber: request.pageNumber,
      error: {
        code:
          error instanceof InvalidPixelBufferError
            ? 'invalid-pixel-buffer'
            : 'worker-failure',
        message:
          error instanceof Error
            ? error.message
            : 'The visual comparison worker failed unexpectedly.'
      }
    });
  } finally {
    activeRequestIds.delete(request.requestId);
    cancelledRequestIds.delete(request.requestId);
  }
}

workerScope.onmessage = (event) => {
  const request = event.data;

  if (request.type === 'cancel') {
    cancelledRequestIds.add(request.requestId);
    return;
  }

  void handleComparison(request);
};

export {};
