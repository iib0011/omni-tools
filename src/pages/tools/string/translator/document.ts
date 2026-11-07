import { getFileExtension } from '@utils/file';
import { TranslatorError } from './service';
import { LibreServerSettings } from './types';

/** Formats requested in issue #500; the server may support a subset. */
export const DOCUMENT_EXTENSIONS = [
  'txt',
  'odt',
  'odp',
  'docx',
  'pptx',
  'epub',
  'html',
  'srt',
  'pdf'
] as const;

/**
 * Client-side upload limit. LibreTranslate itself does not cap file size, but
 * very large uploads are slow and are usually rejected by reverse proxies.
 */
export const MAX_DOCUMENT_SIZE_BYTES = 20 * 1024 * 1024;

/**
 * Extensions (without the dot) accepted for upload: the requested formats,
 * narrowed to what the server reports in `supportedFilesFormat` when known.
 */
export function getAcceptedExtensions(
  settings: LibreServerSettings | null
): string[] {
  const serverFormats = settings?.supportedFilesFormat ?? [];
  if (serverFormats.length === 0) return [...DOCUMENT_EXTENSIONS];
  const normalized = new Set(
    serverFormats.map((format) => format.replace(/^\./, '').toLowerCase())
  );
  return DOCUMENT_EXTENSIONS.filter((ext) => normalized.has(ext));
}

/** Throws a TranslatorError if the file cannot be submitted for translation. */
export function validateDocument(
  file: File,
  acceptedExtensions: readonly string[],
  maxSizeBytes: number = MAX_DOCUMENT_SIZE_BYTES
): void {
  const extension = getFileExtension(file.name);
  if (!extension || !acceptedExtensions.includes(extension)) {
    throw new TranslatorError('unsupportedFormat');
  }
  if (file.size === 0) throw new TranslatorError('emptyFile');
  if (file.size > maxSizeBytes) throw new TranslatorError('fileTooLarge');
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${parseFloat(value.toFixed(1))} ${units[unit]}`;
}
