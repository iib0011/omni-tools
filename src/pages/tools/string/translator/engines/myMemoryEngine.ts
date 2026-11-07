import { throwIfAborted, TranslatorError } from '../errors';
import { normalizeLanguageCode } from '../languages';
import { AUTO_DETECT, DetectedLanguage } from '../types';

/*
 * Free MyMemory translation API (https://mymemory.translated.net/doc/spec.php).
 * No API key; anonymous use is limited to ~5,000 characters per day and
 * 500 bytes per request. Errors are reported in the JSON body, often with
 * HTTP 200, so the body is always validated.
 */

export const MYMEMORY_ENDPOINT = 'https://api.mymemory.translated.net/get';
export const MYMEMORY_MAX_BYTES = 500;
export const MYMEMORY_DAILY_CHAR_LIMIT = 5000;
export const MYMEMORY_TIMEOUT_MS = 30_000;

const encoder = new TextEncoder();
const byteLength = (text: string) => encoder.encode(text).length;

/** MyMemory expects region codes for Chinese variants. */
function toMyMemoryCode(code: string): string {
  if (code === AUTO_DETECT) return 'autodetect';
  if (code === 'zh') return 'zh-CN';
  if (code === 'zh-Hant') return 'zh-TW';
  return code;
}

function splitByCodePoints(text: string, maxBytes: number): string[] {
  const parts: string[] = [];
  let current = '';
  for (const char of text) {
    if (current && byteLength(current + char) > maxBytes) {
      parts.push(current);
      current = '';
    }
    current += char;
  }
  if (current) parts.push(current);
  return parts;
}

/** Greedily packs `units` into strings of at most `maxBytes`. */
function pack(units: string[], maxBytes: number): string[] {
  const chunks: string[] = [];
  let current = '';
  for (const unit of units) {
    if (current && byteLength(current + unit) > maxBytes) {
      chunks.push(current);
      current = '';
    }
    current += unit;
  }
  if (current) chunks.push(current);
  return chunks;
}

/**
 * Splits text into chunks of at most `maxBytes` UTF-8 bytes, preferring
 * sentence boundaries, then word boundaries, then code points. Joining the
 * chunks reproduces the input exactly.
 */
export function splitIntoChunks(
  text: string,
  maxBytes: number = MYMEMORY_MAX_BYTES
): string[] {
  if (byteLength(text) <= maxBytes) return [text];
  const matched = text.match(/[^.!?。！？]*[.!?。！？]+\s*|[^.!?。！？]+$/g);
  // Guard: only use the sentence split if it is lossless.
  const sentences = matched && matched.join('') === text ? matched : [text];
  const units = sentences.flatMap((sentence) => {
    if (byteLength(sentence) <= maxBytes) return [sentence];
    const words = sentence.match(/\S+\s*|\s+/g) ?? [sentence];
    return words.flatMap((word) =>
      byteLength(word) <= maxBytes ? [word] : splitByCodePoints(word, maxBytes)
    );
  });
  return pack(units, maxBytes);
}

async function fetchWithTimeout(
  url: string,
  signal?: AbortSignal
): Promise<Response> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, MYMEMORY_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort);
  try {
    return await fetch(url, { signal: controller.signal });
  } catch {
    if (timedOut) throw new TranslatorError('timeout');
    throwIfAborted(signal);
    throw new TranslatorError('network');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}

interface ChunkResult {
  translatedText: string;
  detectedLanguage?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

async function translateChunk(
  text: string,
  source: string,
  target: string,
  signal?: AbortSignal
): Promise<ChunkResult> {
  const params = new URLSearchParams({
    q: text,
    langpair: `${toMyMemoryCode(source)}|${toMyMemoryCode(target)}`
  });
  const response = await fetchWithTimeout(
    `${MYMEMORY_ENDPOINT}?${params}`,
    signal
  );
  if (response.status === 429) throw new TranslatorError('quotaExceeded');
  if (!response.ok) {
    throw new TranslatorError('serverError', `HTTP ${response.status}`);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new TranslatorError('invalidResponse');
  }
  if (!isRecord(body) || !isRecord(body.responseData)) {
    throw new TranslatorError('invalidResponse');
  }

  const status = Number(body.responseStatus);
  const translated = body.responseData.translatedText;
  const details =
    typeof body.responseDetails === 'string' ? body.responseDetails : '';

  if (
    body.quotaFinished === true ||
    status === 429 ||
    (typeof translated === 'string' &&
      translated.startsWith('MYMEMORY WARNING'))
  ) {
    throw new TranslatorError('quotaExceeded');
  }
  if (status !== 200) {
    if (/invalid (source|target) language|language pair/i.test(details)) {
      throw new TranslatorError('unsupportedLanguage', details);
    }
    throw new TranslatorError('serverError', details || undefined);
  }
  if (typeof translated !== 'string') {
    throw new TranslatorError('invalidResponse');
  }
  const detected = body.responseData.detectedLanguage;
  return {
    translatedText: translated,
    detectedLanguage: typeof detected === 'string' ? detected : undefined
  };
}

/** Translates `text` (any length) via MyMemory, chunking as required. */
export async function translateWithMyMemory(
  text: string,
  source: string,
  target: string,
  signal?: AbortSignal
): Promise<{ translatedText: string; detectedLanguage?: DetectedLanguage }> {
  let effectiveSource = source;
  let detectedLanguage: DetectedLanguage | undefined;
  const output: string[] = [];

  for (const chunk of splitIntoChunks(text)) {
    throwIfAborted(signal);
    const core = chunk.trim();
    if (!core) {
      output.push(chunk);
      continue;
    }
    const result = await translateChunk(core, effectiveSource, target, signal);
    if (effectiveSource === AUTO_DETECT) {
      const language = result.detectedLanguage
        ? normalizeLanguageCode(result.detectedLanguage)
        : null;
      if (!language) throw new TranslatorError('detectionFailed');
      detectedLanguage = { language };
      // Reuse the detected language for the remaining chunks.
      effectiveSource = language;
      if (language === target) throw new TranslatorError('sameLanguage');
    }
    const lead = chunk.match(/^\s*/)?.[0] ?? '';
    const trail = chunk.match(/\s*$/)?.[0] ?? '';
    output.push(lead + result.translatedText + trail);
  }
  return { translatedText: output.join(''), detectedLanguage };
}
