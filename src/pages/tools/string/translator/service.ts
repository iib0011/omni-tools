import mime from 'mime';
import { getFileExtension } from '@utils/file';
import {
  AUTO_DETECT,
  DetectedLanguage,
  DocumentTranslationRequest,
  LibreLanguage,
  LibreServerSettings,
  TextTranslationRequest,
  TextTranslationResult,
  TranslatorConfig,
  TranslatorErrorCode
} from './types';

export const TEXT_TIMEOUT_MS = 30_000;
export const METADATA_TIMEOUT_MS = 15_000;
export const DOCUMENT_TIMEOUT_MS = 180_000;

const CONFIG_STORAGE_KEY = 'translator.libretranslate';

/**
 * Error raised by the LibreTranslate client. `code` identifies the failure
 * category; `serverMessage` holds the (possibly localized) message returned by
 * the server, if any, so the UI can show it as additional detail.
 */
export class TranslatorError extends Error {
  readonly code: TranslatorErrorCode;
  readonly status?: number;
  readonly serverMessage?: string;

  constructor(
    code: TranslatorErrorCode,
    options: { status?: number; serverMessage?: string } = {}
  ) {
    super(options.serverMessage || code);
    this.name = 'TranslatorError';
    this.code = code;
    this.status = options.status;
    this.serverMessage = options.serverMessage;
  }
}

export const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === 'AbortError';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Build-time defaults supplied via `VITE_LIBRETRANSLATE_*` env variables. */
export function getDefaultConfig(): TranslatorConfig {
  return {
    serverUrl: import.meta.env.VITE_LIBRETRANSLATE_URL?.trim() ?? '',
    apiKey: import.meta.env.VITE_LIBRETRANSLATE_API_KEY?.trim() ?? ''
  };
}

/** Returns the user's saved settings, falling back to build-time defaults. */
export function loadConfig(): TranslatorConfig {
  const defaults = getDefaultConfig();
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return defaults;
    return {
      serverUrl:
        typeof parsed.serverUrl === 'string'
          ? parsed.serverUrl
          : defaults.serverUrl,
      apiKey:
        typeof parsed.apiKey === 'string' ? parsed.apiKey : defaults.apiKey
    };
  } catch {
    return defaults;
  }
}

export function saveConfig(config: TranslatorConfig): void {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Storage may be unavailable (private mode, quota); settings then last
    // for the current session only.
  }
}

/**
 * Validates and normalizes a server URL: must be http(s), no credentials,
 * query or fragment; trailing slashes are removed.
 */
export function normalizeServerUrl(serverUrl: string): string {
  const trimmed = serverUrl.trim();
  if (!trimmed) throw new TranslatorError('notConfigured');

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new TranslatorError('invalidServerUrl');
  }
  if (
    (url.protocol !== 'http:' && url.protocol !== 'https:') ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new TranslatorError('invalidServerUrl');
  }
  return `${url.origin}${url.pathname}`.replace(/\/+$/, '');
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * `fetch` with a timeout that also honours an external abort signal.
 * Rejects with `TranslatorError('timeout' | 'network')`, or re-throws the
 * `AbortError` when the caller cancelled.
 */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
  signal?: AbortSignal
): Promise<Response> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const onExternalAbort = () => controller.abort();

  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', onExternalAbort);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (timedOut) throw new TranslatorError('timeout');
    if (signal?.aborted) {
      throw new DOMException('The operation was aborted.', 'AbortError');
    }
    // Browser network errors are generic ("Failed to fetch") and may stem
    // from DNS, offline state or CORS; the UI explains all of these.
    throw new TranslatorError('network');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onExternalAbort);
  }
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const text = await response.text();
    try {
      const body: unknown = JSON.parse(text);
      if (isRecord(body) && typeof body.error === 'string') return body.error;
    } catch {
      // Not JSON (e.g. an HTML error page from a proxy); ignore the body.
    }
  } catch {
    // Body could not be read.
  }
  return '';
}

/**
 * Maps a failed HTTP response to a TranslatorError. LibreTranslate returns
 * `{ "error": "..." }`; status codes are the primary signal, and the English
 * message text is only used to refine the category of a 400/403.
 */
export async function errorFromResponse(
  response: Response,
  apiKeySent: boolean
): Promise<TranslatorError> {
  const status = response.status;
  const serverMessage = await readErrorMessage(response);
  const message = serverMessage.toLowerCase();
  const opts = { status, serverMessage: serverMessage || undefined };

  if (status === 429) return new TranslatorError('rateLimited', opts);
  if (status === 404) return new TranslatorError('endpointNotFound', opts);
  if (status === 413) return new TranslatorError('fileTooLarge', opts);
  if (status >= 500) return new TranslatorError('serverError', opts);

  if (status === 401 || status === 403) {
    if (message.includes('files translation')) {
      return new TranslatorError('filesDisabled', opts);
    }
    if (message.includes('too many')) {
      return new TranslatorError('rateLimited', opts);
    }
    return new TranslatorError(apiKeySent ? 'invalidKey' : 'keyRequired', opts);
  }

  if (status === 400) {
    if (message.includes('file format not supported')) {
      return new TranslatorError('unsupportedFormat', opts);
    }
    if (message.includes('is not supported')) {
      return new TranslatorError('unsupportedLanguage', opts);
    }
    if (message.includes('exceeds text limit')) {
      return new TranslatorError('textTooLong', opts);
    }
    if (message.includes('api key')) {
      return new TranslatorError(
        apiKeySent ? 'invalidKey' : 'keyRequired',
        opts
      );
    }
  }
  return new TranslatorError('badRequest', opts);
}

async function parseJsonBody(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new TranslatorError('invalidResponse', { status: response.status });
  }
}

async function requestJson(
  config: TranslatorConfig,
  path: string,
  init: RequestInit,
  timeoutMs: number,
  signal?: AbortSignal
): Promise<unknown> {
  const baseUrl = normalizeServerUrl(config.serverUrl);
  const response = await fetchWithTimeout(
    `${baseUrl}${path}`,
    { ...init, headers: { Accept: 'application/json', ...init.headers } },
    timeoutMs,
    signal
  );
  if (!response.ok) {
    throw await errorFromResponse(response, Boolean(config.apiKey.trim()));
  }
  return parseJsonBody(response);
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

/** `GET /languages` — languages available on the configured server. */
export async function fetchLanguages(
  config: TranslatorConfig,
  signal?: AbortSignal
): Promise<LibreLanguage[]> {
  const body = await requestJson(
    config,
    '/languages',
    { method: 'GET' },
    METADATA_TIMEOUT_MS,
    signal
  );
  if (!Array.isArray(body)) throw new TranslatorError('invalidResponse');

  const languages = body
    .filter(
      (item): item is Record<string, unknown> =>
        isRecord(item) &&
        typeof item.code === 'string' &&
        typeof item.name === 'string'
    )
    .map<LibreLanguage>((item) => ({
      code: item.code as string,
      name: item.name as string,
      targets: Array.isArray(item.targets)
        ? item.targets.filter((t): t is string => typeof t === 'string')
        : undefined
    }));

  if (body.length > 0 && languages.length === 0) {
    throw new TranslatorError('invalidResponse');
  }
  return languages.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * `GET /frontend/settings` — server capabilities. Returns `null` when the
 * endpoint is unavailable (older servers, restrictive proxies), in which case
 * the tool falls back to permissive defaults and relies on API errors.
 */
export async function fetchServerSettings(
  config: TranslatorConfig,
  signal?: AbortSignal
): Promise<LibreServerSettings | null> {
  let body: unknown;
  try {
    body = await requestJson(
      config,
      '/frontend/settings',
      { method: 'GET' },
      METADATA_TIMEOUT_MS,
      signal
    );
  } catch (error) {
    if (
      error instanceof TranslatorError &&
      (error.code === 'endpointNotFound' || error.code === 'invalidResponse')
    ) {
      return null;
    }
    throw error;
  }
  if (!isRecord(body)) return null;

  return {
    charLimit: typeof body.charLimit === 'number' ? body.charLimit : -1,
    keyRequired: body.keyRequired === true,
    filesTranslation: body.filesTranslation !== false,
    supportedFilesFormat: Array.isArray(body.supportedFilesFormat)
      ? body.supportedFilesFormat
          .filter((f): f is string => typeof f === 'string')
          .map((f) => f.toLowerCase())
      : []
  };
}

function withApiKey<T extends object>(
  config: TranslatorConfig,
  payload: T
): T & { api_key?: string } {
  const apiKey = config.apiKey.trim();
  return apiKey ? { ...payload, api_key: apiKey } : payload;
}

/** Throws a TranslatorError for requests the server would reject anyway. */
export function validateLanguages(source: string, target: string): void {
  if (!target || target === AUTO_DETECT || !source) {
    throw new TranslatorError('unsupportedLanguage');
  }
  if (source === target) throw new TranslatorError('sameLanguage');
}

function parseDetectedLanguage(value: unknown): DetectedLanguage | undefined {
  if (
    isRecord(value) &&
    typeof value.language === 'string' &&
    typeof value.confidence === 'number'
  ) {
    return { language: value.language, confidence: value.confidence };
  }
  return undefined;
}

/** `POST /translate` — translates plain text. */
export async function translateText(
  config: TranslatorConfig,
  { text, source, target }: TextTranslationRequest,
  signal?: AbortSignal
): Promise<TextTranslationResult> {
  if (!text.trim()) throw new TranslatorError('emptyInput');
  validateLanguages(source, target);

  const body = await requestJson(
    config,
    '/translate',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        withApiKey(config, { q: text, source, target, format: 'text' })
      )
    },
    TEXT_TIMEOUT_MS,
    signal
  );

  if (!isRecord(body) || typeof body.translatedText !== 'string') {
    throw new TranslatorError('invalidResponse');
  }
  return {
    translatedText: body.translatedText,
    detectedLanguage: parseDetectedLanguage(body.detectedLanguage)
  };
}

/**
 * Resolves the `translatedFileUrl` returned by `/translate_file` against the
 * configured server, so the translated document is only ever downloaded from
 * that server. LibreTranslate builds the URL with the host it sees, which can
 * differ from the public URL behind a reverse proxy; in that case the
 * `/download_file/...` path is re-based onto the configured server URL.
 */
export function resolveDownloadUrl(
  serverUrl: string,
  translatedFileUrl: string
): string {
  const base = normalizeServerUrl(serverUrl);
  let url: URL;
  try {
    url = new URL(translatedFileUrl, `${base}/`);
  } catch {
    throw new TranslatorError('invalidResponse');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new TranslatorError('invalidResponse');
  }
  if (url.origin === new URL(base).origin) return url.href;

  const marker = '/download_file/';
  const index = url.pathname.indexOf(marker);
  if (index === -1) throw new TranslatorError('invalidResponse');
  return `${base}${url.pathname.slice(index)}`;
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

/**
 * `POST /translate_file`, then downloads the translated document. Returns a
 * new File with the original extension; the uploaded File is never modified.
 */
export async function translateDocument(
  config: TranslatorConfig,
  { file, source, target }: DocumentTranslationRequest,
  signal?: AbortSignal
): Promise<File> {
  if (file.size === 0) throw new TranslatorError('emptyFile');
  validateLanguages(source, target);

  const form = new FormData();
  form.append('file', file, file.name);
  form.append('source', source);
  form.append('target', target);
  const apiKey = config.apiKey.trim();
  if (apiKey) form.append('api_key', apiKey);

  const body = await requestJson(
    config,
    '/translate_file',
    { method: 'POST', body: form },
    DOCUMENT_TIMEOUT_MS,
    signal
  );
  if (!isRecord(body) || typeof body.translatedFileUrl !== 'string') {
    throw new TranslatorError('invalidResponse');
  }

  const downloadUrl = resolveDownloadUrl(
    config.serverUrl,
    body.translatedFileUrl
  );

  let response: Response;
  try {
    response = await fetchWithTimeout(
      downloadUrl,
      { method: 'GET' },
      DOCUMENT_TIMEOUT_MS,
      signal
    );
  } catch (error) {
    if (error instanceof TranslatorError && error.code === 'network') {
      throw new TranslatorError('downloadFailed');
    }
    throw error;
  }
  if (!response.ok) {
    throw new TranslatorError('downloadFailed', { status: response.status });
  }

  const blob = await response.blob();
  if (blob.size === 0) throw new TranslatorError('downloadFailed');

  const name = buildTranslatedFileName(file.name, target);
  const type =
    mime.getType(getFileExtension(name)) ||
    blob.type ||
    'application/octet-stream';
  return new File([blob], name, { type });
}
