import { buildTranslatedFileName, validateDocument } from './document';
import { parseDocument } from './documents/formats';
import {
  detectWithBrowser,
  getBrowserTranslator,
  isBrowserTranslatorSupported
} from './engines/browserEngine';
import {
  MYMEMORY_DAILY_CHAR_LIMIT,
  translateWithMyMemory
} from './engines/myMemoryEngine';
import { isAbortError, throwIfAborted, TranslatorError } from './errors';
import {
  AUTO_DETECT,
  DetectedLanguage,
  DocumentTranslationResult,
  TextTranslationResult,
  TranslationEngine,
  TranslationOptions,
  TranslationRequest
} from './types';

export { isAbortError, TranslatorError };

/** Max characters sent to the language detector as a sample. */
const DETECTION_SAMPLE_CHARS = 2000;

/** Engine used when the browser can translate on-device, else the fallback. */
export function getPreferredEngine(): TranslationEngine {
  return isBrowserTranslatorSupported() ? 'browser' : 'mymemory';
}

/** Throws a TranslatorError for language selections that cannot work. */
export function validateLanguages(source: string, target: string): void {
  if (!source || !target || target === AUTO_DETECT) {
    throw new TranslatorError('unsupportedLanguage');
  }
  if (source === target) throw new TranslatorError('sameLanguage');
}

interface Session {
  engine: TranslationEngine;
  detectedLanguage?: DetectedLanguage;
  translate: (text: string) => Promise<string>;
}

/**
 * Prepares a translator for the request: on-device when the browser supports
 * the (detected) language pair, otherwise the MyMemory fallback.
 */
async function openSession(
  { source, target }: TranslationRequest,
  sample: string,
  { signal, onProgress }: TranslationOptions
): Promise<Session> {
  validateLanguages(source, target);
  const onDownload = (loaded: number) =>
    onProgress?.({ phase: 'downloading', loaded });

  let resolvedSource = source;
  let detectedLanguage: DetectedLanguage | undefined;

  if (isBrowserTranslatorSupported()) {
    if (resolvedSource === AUTO_DETECT) {
      const detected = await detectWithBrowser(sample, onDownload, signal);
      if (detected) {
        detectedLanguage = detected;
        resolvedSource = detected.language;
        if (resolvedSource === target) {
          throw new TranslatorError('sameLanguage');
        }
      }
    }
    if (resolvedSource !== AUTO_DETECT) {
      const translator = await getBrowserTranslator(
        resolvedSource,
        target,
        onDownload,
        signal
      );
      if (translator) {
        return {
          engine: 'browser',
          detectedLanguage,
          translate: async (text) => {
            try {
              return await translator.translate(text, { signal });
            } catch (error) {
              if (isAbortError(error)) throw error;
              throw new TranslatorError(
                'serverError',
                error instanceof Error ? error.message : undefined
              );
            }
          }
        };
      }
    }
  }

  // Fallback: MyMemory web service.
  let onlineSource = resolvedSource;
  const session: Session = {
    engine: 'mymemory',
    detectedLanguage,
    translate: async (text) => {
      const result = await translateWithMyMemory(
        text,
        onlineSource,
        target,
        signal
      );
      if (result.detectedLanguage && !session.detectedLanguage) {
        session.detectedLanguage = result.detectedLanguage;
        onlineSource = result.detectedLanguage.language;
      }
      return result.translatedText;
    }
  };
  return session;
}

const hasLetters = (text: string) => /\p{L}/u.test(text);

interface SegmentResult {
  translations: string[];
  engine: TranslationEngine;
  detectedLanguage?: DetectedLanguage;
}

/**
 * Translates segments, preserving each one's surrounding whitespace.
 * Segments without letters are kept as-is and duplicates are translated
 * once. `maxOnlineChars` rejects work that would exceed the fallback quota.
 */
async function translateSegments(
  segments: string[],
  request: TranslationRequest,
  options: TranslationOptions,
  maxOnlineChars?: number
): Promise<SegmentResult> {
  const prepared = segments.map((segment) => {
    const core = segment.trim();
    return {
      lead: segment.slice(0, segment.length - segment.trimStart().length),
      core,
      trail: segment.slice(segment.trimEnd().length),
      translatable: hasLetters(core)
    };
  });
  const unique = [
    ...new Set(prepared.filter((p) => p.translatable).map((p) => p.core))
  ];
  if (unique.length === 0) throw new TranslatorError('noTextFound');

  const session = await openSession(
    request,
    unique.join('\n').slice(0, DETECTION_SAMPLE_CHARS),
    options
  );

  const totalChars = unique.reduce((sum, core) => sum + core.length, 0);
  if (
    session.engine === 'mymemory' &&
    maxOnlineChars !== undefined &&
    totalChars > maxOnlineChars
  ) {
    throw new TranslatorError('documentTooLongForOnline', String(totalChars));
  }

  const translated = new Map<string, string>();
  options.onProgress?.({ phase: 'translating', done: 0, total: unique.length });
  for (const [index, core] of unique.entries()) {
    throwIfAborted(options.signal);
    translated.set(core, await session.translate(core));
    options.onProgress?.({
      phase: 'translating',
      done: index + 1,
      total: unique.length
    });
  }

  return {
    translations: prepared.map((p) =>
      p.translatable
        ? p.lead + translated.get(p.core) + p.trail
        : p.lead + p.core + p.trail
    ),
    engine: session.engine,
    detectedLanguage: session.detectedLanguage
  };
}

/** Translates plain text line by line, keeping line breaks. */
export async function translateText(
  text: string,
  request: TranslationRequest,
  options: TranslationOptions = {}
): Promise<TextTranslationResult> {
  if (!text.trim()) throw new TranslatorError('emptyInput');
  validateLanguages(request.source, request.target);

  const pieces = text.split(/(\r?\n)/);
  const lineIndexes = pieces
    .map((piece, i) => (i % 2 === 0 && piece.trim() ? i : -1))
    .filter((i) => i !== -1);

  let result: SegmentResult;
  try {
    result = await translateSegments(
      lineIndexes.map((i) => pieces[i]),
      request,
      options
    );
  } catch (error) {
    // Numbers / symbols only: nothing to translate.
    if (error instanceof TranslatorError && error.code === 'noTextFound') {
      return { translatedText: text, engine: getPreferredEngine() };
    }
    throw error;
  }

  const output = [...pieces];
  lineIndexes.forEach((pieceIndex, i) => {
    output[pieceIndex] = result.translations[i];
  });
  return {
    translatedText: output.join(''),
    engine: result.engine,
    detectedLanguage: result.detectedLanguage
  };
}

/**
 * Translates a document entirely in the browser: its text is extracted,
 * translated and written back into a copy with the same format. The
 * original File is never modified.
 */
export async function translateDocument(
  file: File,
  request: TranslationRequest,
  options: TranslationOptions = {}
): Promise<DocumentTranslationResult> {
  validateDocument(file);
  validateLanguages(request.source, request.target);

  const parsed = await parseDocument(file);
  if (parsed.segments.length === 0) throw new TranslatorError('noTextFound');

  const result = await translateSegments(
    parsed.segments,
    request,
    options,
    MYMEMORY_DAILY_CHAR_LIMIT
  );
  throwIfAborted(options.signal);

  let blob: Blob;
  try {
    blob = await parsed.build(result.translations);
  } catch {
    throw new TranslatorError('corruptDocument');
  }
  return {
    file: new File([blob], buildTranslatedFileName(file.name, request.target), {
      type: blob.type
    }),
    engine: result.engine,
    detectedLanguage: result.detectedLanguage
  };
}
