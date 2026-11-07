import { TranslatorError } from '../errors';
import { normalizeLanguageCode } from '../languages';
import { DetectedLanguage } from '../types';

/*
 * Wrapper around the browser's built-in, on-device AI APIs
 * (Translator and LanguageDetector; Chrome 138+ / Edge desktop).
 * https://developer.chrome.com/docs/ai/translator-api
 */

type Availability =
  | 'unavailable'
  | 'downloadable'
  | 'downloading'
  | 'available';

interface DownloadMonitor {
  addEventListener(
    type: 'downloadprogress',
    listener: (event: { loaded: number }) => void
  ): void;
}

interface CreateOptions {
  signal?: AbortSignal;
  monitor?: (monitor: DownloadMonitor) => void;
}

interface BuiltInTranslator {
  translate(text: string, options?: { signal?: AbortSignal }): Promise<string>;
}

interface TranslatorFactory {
  availability(options: {
    sourceLanguage: string;
    targetLanguage: string;
  }): Promise<Availability>;
  create(
    options: { sourceLanguage: string; targetLanguage: string } & CreateOptions
  ): Promise<BuiltInTranslator>;
}

interface BuiltInLanguageDetector {
  detect(
    text: string,
    options?: { signal?: AbortSignal }
  ): Promise<{ detectedLanguage: string; confidence: number }[]>;
}

interface LanguageDetectorFactory {
  availability(): Promise<Availability>;
  create(options?: CreateOptions): Promise<BuiltInLanguageDetector>;
}

const globals = globalThis as unknown as {
  Translator?: TranslatorFactory;
  LanguageDetector?: LanguageDetectorFactory;
};

/** Minimum detection confidence (0–1) for an automatic detection to be used. */
const MIN_DETECTION_CONFIDENCE = 0.5;

export function isBrowserTranslatorSupported(): boolean {
  return typeof globals.Translator?.create === 'function';
}

export function isBrowserLanguageDetectorSupported(): boolean {
  return typeof globals.LanguageDetector?.create === 'function';
}

const translatorCache = new Map<string, Promise<BuiltInTranslator>>();
let detectorPromise: Promise<BuiltInLanguageDetector> | null = null;

/** Clears cached model instances (used by tests). */
export function resetBrowserEngine(): void {
  translatorCache.clear();
  detectorPromise = null;
}

/** Rejection used internally when a model download stalls. */
class ModelStalledError extends Error {}

/**
 * Handles a failed `create()`: cancellation is re-thrown, a missing user
 * gesture asks the user to click again, and anything else (model download
 * failed or stalled, pair unsupported on this device) returns `null` so the
 * caller falls back to the online engine, as the privacy notice describes.
 */
function handleCreateError(error: unknown): null {
  if (error instanceof DOMException) {
    if (error.name === 'AbortError') throw error;
    // Downloading a model requires a recent click / key press.
    if (error.name === 'NotAllowedError') {
      throw new TranslatorError('activationRequired');
    }
  }
  return null;
}

/**
 * `availability()` normally answers immediately; if the browser never
 * answers (e.g. its model service is disabled), treat the API as unavailable.
 */
export const AVAILABILITY_TIMEOUT_MS = 10_000;
/** A model download that reports no progress for this long is abandoned. */
export const MODEL_STALL_TIMEOUT_MS = 60_000;

function availabilityWithTimeout(
  check: () => Promise<Availability>
): Promise<Availability> {
  return new Promise((resolve) => {
    const timer = setTimeout(
      () => resolve('unavailable'),
      AVAILABILITY_TIMEOUT_MS
    );
    check()
      .then(resolve, () => resolve('unavailable'))
      .finally(() => clearTimeout(timer));
  });
}

/**
 * Runs `create()` with a watchdog: each download progress event resets it,
 * and a stalled download is aborted (the caller then falls back online).
 */
function createWithWatchdog<T>(
  create: (options: CreateOptions) => Promise<T>,
  onDownloadProgress?: (loaded: number) => void,
  signal?: AbortSignal
): Promise<T> {
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort);

  return new Promise<T>((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout>;
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        controller.abort();
        reject(new ModelStalledError());
      }, MODEL_STALL_TIMEOUT_MS);
    };
    arm();
    create({
      signal: controller.signal,
      monitor: (monitor) =>
        monitor.addEventListener('downloadprogress', (event) => {
          arm();
          onDownloadProgress?.(event.loaded);
        })
    })
      .then(resolve, reject)
      .finally(() => {
        clearTimeout(timer);
        signal?.removeEventListener('abort', onAbort);
      });
  });
}

/**
 * Returns an on-device translator for the pair, or `null` if the browser
 * cannot translate it (API missing, pair unavailable, or the model could
 * not be set up), so the caller falls back online. May download a
 * language model, reporting progress (0–1).
 */
export async function getBrowserTranslator(
  source: string,
  target: string,
  onDownloadProgress?: (loaded: number) => void,
  signal?: AbortSignal
): Promise<BuiltInTranslator | null> {
  const factory = globals.Translator;
  if (!factory || typeof factory.create !== 'function') return null;

  const key = `${source}|${target}`;
  const cached = translatorCache.get(key);
  if (cached) return cached;

  const availability = await availabilityWithTimeout(() =>
    factory.availability({ sourceLanguage: source, targetLanguage: target })
  );
  if (availability === 'unavailable') return null;

  const promise = createWithWatchdog(
    (options) =>
      factory.create({
        sourceLanguage: source,
        targetLanguage: target,
        ...options
      }),
    onDownloadProgress,
    signal
  );
  translatorCache.set(key, promise);
  try {
    return await promise;
  } catch (error) {
    translatorCache.delete(key);
    return handleCreateError(error);
  }
}

/**
 * Detects the language of `text` on-device. Returns `null` if detection is
 * unavailable in this browser; throws `detectionFailed` when the result is
 * unreliable or not one of the offered languages.
 */
export async function detectWithBrowser(
  text: string,
  onDownloadProgress?: (loaded: number) => void,
  signal?: AbortSignal
): Promise<DetectedLanguage | null> {
  const factory = globals.LanguageDetector;
  if (!factory || typeof factory.create !== 'function') return null;

  if (
    (await availabilityWithTimeout(() => factory.availability())) ===
    'unavailable'
  ) {
    return null;
  }

  if (!detectorPromise) {
    detectorPromise = createWithWatchdog(
      (options) => factory.create(options),
      onDownloadProgress,
      signal
    );
  }
  let detector: BuiltInLanguageDetector;
  try {
    detector = await detectorPromise;
  } catch (error) {
    detectorPromise = null;
    return handleCreateError(error);
  }

  const [best] = await detector.detect(text, { signal });
  const language = best ? normalizeLanguageCode(best.detectedLanguage) : null;
  if (!best || !language || best.confidence < MIN_DETECTION_CONFIDENCE) {
    throw new TranslatorError('detectionFailed');
  }
  return { language, confidence: Math.round(best.confidence * 100) };
}
