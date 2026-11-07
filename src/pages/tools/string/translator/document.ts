import { getFileExtension } from '@utils/file';
import { TranslatorError } from './errors';
import { SUPPORTED_DOCUMENT_EXTENSIONS } from './documents/formats';

/** Formats shown to the user (`htm` is accepted as an alias of `html`). */
export const DOCUMENT_FORMATS = [
  'txt',
  'docx',
  'odt',
  'pptx',
  'odp',
  'epub',
  'html',
  'srt'
] as const;

export const ACCEPTED_EXTENSIONS: readonly string[] =
  SUPPORTED_DOCUMENT_EXTENSIONS;

/** Upload limit: documents are parsed and rebuilt in browser memory. */
export const MAX_DOCUMENT_SIZE_BYTES = 20 * 1024 * 1024;

/** Throws a TranslatorError if the file cannot be translated. */
export function validateDocument(
  file: File,
  maxSizeBytes: number = MAX_DOCUMENT_SIZE_BYTES
): void {
  const extension = getFileExtension(file.name);
  if (!extension || !ACCEPTED_EXTENSIONS.includes(extension)) {
    throw new TranslatorError('unsupportedFormat');
  }
  if (file.size === 0) throw new TranslatorError('emptyFile');
  if (file.size > maxSizeBytes) throw new TranslatorError('fileTooLarge');
}

/** `report.docx` + `es` → `report.es.docx`. */
export function buildTranslatedFileName(
  originalName: string,
  target: string
): string {
  const extension = getFileExtension(originalName);
  if (!extension) return `${originalName}.${target}`;
  const base = originalName.slice(0, -(extension.length + 1));
  return `${base}.${target}.${extension}`;
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
