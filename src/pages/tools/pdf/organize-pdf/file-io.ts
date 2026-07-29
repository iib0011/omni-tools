import { saveBlob } from '../../../../lib/pdf-workbench/save-file';

const abortError = () =>
  new DOMException('The operation was cancelled.', 'AbortError');

export const readFileAsArrayBuffer = (
  file: File,
  signal?: AbortSignal
): Promise<ArrayBuffer> =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }

    const reader = new FileReader();
    const onAbort = () => reader.abort();

    reader.onload = () => {
      signal?.removeEventListener('abort', onAbort);
      if (reader.result instanceof ArrayBuffer) resolve(reader.result);
      else reject(new Error('The PDF file could not be read.'));
    };
    reader.onerror = () => {
      signal?.removeEventListener('abort', onAbort);
      reject(reader.error ?? new Error('The PDF file could not be read.'));
    };
    reader.onabort = () => {
      signal?.removeEventListener('abort', onAbort);
      reject(abortError());
    };

    signal?.addEventListener('abort', onAbort, { once: true });
    reader.readAsArrayBuffer(file);
  });

const LARGE_FILE_THRESHOLD = 64 * 1024 * 1024;

export const saveOrganizedPdf = async (
  file: File,
  description: string
): Promise<void> => {
  await saveBlob(file, {
    suggestedName: file.name,
    mimeType: 'application/pdf',
    extensions: ['.pdf'],
    description,
    preferFilePicker: file.size >= LARGE_FILE_THRESHOLD
  });
};
