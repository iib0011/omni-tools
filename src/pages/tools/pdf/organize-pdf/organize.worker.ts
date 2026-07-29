import {
  exportOrganizedPdf,
  inspectOrganizerPdf,
  OrganizerServiceError
} from './service';
import {
  OrganizerErrorPayload,
  OrganizerWorkerRequest,
  OrganizerWorkerResponse
} from './types';

interface OrganizerWorkerScope {
  onmessage: ((event: MessageEvent<OrganizerWorkerRequest>) => void) | null;
  postMessage: (
    message: OrganizerWorkerResponse,
    transfer?: Transferable[]
  ) => void;
}

const workerScope = self as unknown as OrganizerWorkerScope;

const toErrorPayload = (error: unknown): OrganizerErrorPayload => {
  if (error instanceof OrganizerServiceError) {
    return { code: error.code, message: error.message };
  }
  return {
    code: 'WORKER_ERROR',
    message:
      error instanceof Error
        ? error.message
        : 'The PDF worker encountered an unexpected error.'
  };
};

workerScope.onmessage = (event) => {
  const request = event.data;

  void (async () => {
    try {
      if (request.type === 'inspect') {
        const inspection = await inspectOrganizerPdf(
          request.source,
          (progress) =>
            workerScope.postMessage({
              type: 'progress',
              requestId: request.requestId,
              progress
            })
        );
        workerScope.postMessage({
          type: 'inspected',
          requestId: request.requestId,
          inspection
        });
        return;
      }

      const result = await exportOrganizedPdf(
        request.source,
        request.pages,
        (progress) =>
          workerScope.postMessage({
            type: 'progress',
            requestId: request.requestId,
            progress
          })
      );
      workerScope.postMessage(
        {
          type: 'exported',
          requestId: request.requestId,
          result
        },
        [result.bytes]
      );
    } catch (error) {
      workerScope.postMessage({
        type: 'error',
        requestId: request.requestId,
        error: toErrorPayload(error)
      });
    }
  })();
};
