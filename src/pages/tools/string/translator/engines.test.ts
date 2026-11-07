import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AVAILABILITY_TIMEOUT_MS,
  detectWithBrowser,
  getBrowserTranslator,
  isBrowserTranslatorSupported,
  MODEL_STALL_TIMEOUT_MS,
  resetBrowserEngine
} from './engines/browserEngine';
import {
  MYMEMORY_ENDPOINT,
  MYMEMORY_TIMEOUT_MS,
  splitIntoChunks,
  translateWithMyMemory
} from './engines/myMemoryEngine';
import { TranslatorError } from './errors';
import {
  getLanguages,
  getTargetOptions,
  normalizeLanguageCode,
  pickTarget
} from './languages';

const fetchMock = vi.fn<Parameters<typeof fetch>, ReturnType<typeof fetch>>();
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

async function expectCode(promise: Promise<unknown>, code: string) {
  const error = await promise.then(
    () => null,
    (e: unknown) => e
  );
  expect(error).toBeInstanceOf(TranslatorError);
  expect((error as TranslatorError).code).toBe(code);
}

const requestParams = (call = 0) =>
  new URL(String(fetchMock.mock.calls[call][0])).searchParams;

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  resetBrowserEngine();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('splitIntoChunks', () => {
  const bytes = (s: string) => new TextEncoder().encode(s).length;

  it('keeps short text as one chunk', () => {
    expect(splitIntoChunks('Hello world.')).toEqual(['Hello world.']);
  });

  it('splits on sentence boundaries within the byte limit', () => {
    const text = 'One two three. Four five six! Seven eight nine?';
    const chunks = splitIntoChunks(text, 20);
    expect(chunks.join('')).toBe(text);
    expect(chunks).toEqual([
      'One two three. ',
      'Four five six! ',
      'Seven eight nine?'
    ]);
  });

  it('falls back to words and code points, counting UTF-8 bytes', () => {
    const text = `${'é'.repeat(30)} ${'word '.repeat(10)}`.trim();
    const chunks = splitIntoChunks(text, 16);
    expect(chunks.join('')).toBe(text);
    chunks.forEach((chunk) => expect(bytes(chunk)).toBeLessThanOrEqual(16));
  });

  it('is lossless with leading punctuation', () => {
    const text = `...${'a'.repeat(40)}. b`;
    expect(splitIntoChunks(text, 20).join('')).toBe(text);
  });
});

describe('translateWithMyMemory', () => {
  it('translates and maps language codes', async () => {
    fetchMock.mockResolvedValue(
      json({ responseData: { translatedText: '你好' }, responseStatus: 200 })
    );
    const result = await translateWithMyMemory('Hello', 'en', 'zh');
    expect(result.translatedText).toBe('你好');
    expect(String(fetchMock.mock.calls[0][0])).toContain(MYMEMORY_ENDPOINT);
    expect(requestParams().get('q')).toBe('Hello');
    expect(requestParams().get('langpair')).toBe('en|zh-CN');
  });

  it('uses autodetect and reuses the detected language for later chunks', async () => {
    fetchMock
      .mockResolvedValueOnce(
        json({
          responseData: { translatedText: 'A.', detectedLanguage: 'fr-FR' },
          responseStatus: 200
        })
      )
      .mockResolvedValueOnce(
        json({ responseData: { translatedText: 'B.' }, responseStatus: 200 })
      );
    const text = `${'x'.repeat(300)}. ${'y'.repeat(300)}.`;
    const result = await translateWithMyMemory(text, 'auto', 'en');
    expect(requestParams(0).get('langpair')).toBe('autodetect|en');
    expect(requestParams(1).get('langpair')).toBe('fr|en');
    expect(result).toEqual({
      translatedText: 'A. B.',
      detectedLanguage: { language: 'fr' }
    });
  });

  it('rejects when the detected language equals the target', async () => {
    fetchMock.mockResolvedValue(
      json({
        responseData: { translatedText: 'Hi', detectedLanguage: 'en' },
        responseStatus: 200
      })
    );
    await expectCode(translateWithMyMemory('Hi', 'auto', 'en'), 'sameLanguage');
  });

  it.each([
    [
      'quota flag',
      json({
        responseData: { translatedText: 'x' },
        responseStatus: 200,
        quotaFinished: true
      })
    ],
    [
      'quota warning text',
      json({
        responseData: {
          translatedText:
            'MYMEMORY WARNING: YOU USED ALL AVAILABLE FREE TRANSLATIONS FOR TODAY'
        },
        responseStatus: 429
      })
    ],
    ['HTTP 429', new Response('', { status: 429 })]
  ])('reports the daily quota (%s)', async (_label, response) => {
    fetchMock.mockResolvedValue(response);
    await expectCode(translateWithMyMemory('Hi', 'en', 'es'), 'quotaExceeded');
  });

  it('reports invalid languages', async () => {
    fetchMock.mockResolvedValue(
      json({
        responseData: { translatedText: "'XX' IS AN INVALID SOURCE LANGUAGE" },
        responseDetails:
          "'XX' IS AN INVALID SOURCE LANGUAGE . EXAMPLE: LANGPAIR=EN|IT",
        responseStatus: 403
      })
    );
    await expectCode(
      translateWithMyMemory('Hi', 'xx', 'es'),
      'unsupportedLanguage'
    );
  });

  it.each([
    ['server error', new Response('oops', { status: 503 }), 'serverError'],
    ['non-JSON body', new Response('<html>'), 'invalidResponse'],
    [
      'missing text',
      json({ responseData: {}, responseStatus: 200 }),
      'invalidResponse'
    ]
  ])('handles %s', async (_label, response, code) => {
    fetchMock.mockResolvedValue(response);
    await expectCode(translateWithMyMemory('Hi', 'en', 'es'), code);
  });

  it('reports network failures', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    await expectCode(translateWithMyMemory('Hi', 'en', 'es'), 'network');
  });

  it('times out slow requests', async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(
      (_url, init) =>
        new Promise(
          (_resolve, reject) =>
            init?.signal?.addEventListener('abort', () =>
              reject(new DOMException('aborted', 'AbortError'))
            )
        )
    );
    const promise = translateWithMyMemory('Hi', 'en', 'es');
    vi.advanceTimersByTime(MYMEMORY_TIMEOUT_MS);
    await expectCode(promise, 'timeout');
  });

  it('propagates caller cancellation as AbortError', async () => {
    const controller = new AbortController();
    fetchMock.mockImplementation(
      (_url, init) =>
        new Promise(
          (_resolve, reject) =>
            init?.signal?.addEventListener('abort', () =>
              reject(new DOMException('aborted', 'AbortError'))
            )
        )
    );
    const promise = translateWithMyMemory('Hi', 'en', 'es', controller.signal);
    controller.abort();
    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
  });
});

describe('browser engine', () => {
  const stubTranslator = (
    availability = 'available',
    createImpl?: (options: {
      monitor?: (m: unknown) => void;
    }) => Promise<unknown>
  ) => {
    const factory = {
      availability: vi.fn(async () => availability),
      create: vi.fn(
        createImpl ??
          (async (options: { monitor?: (m: unknown) => void }) => {
            options.monitor?.({
              addEventListener: (
                _type: string,
                cb: (e: { loaded: number }) => void
              ) => {
                cb({ loaded: 0.5 });
                cb({ loaded: 1 });
              }
            });
            return { translate: vi.fn(async (text: string) => `T:${text}`) };
          })
      )
    };
    vi.stubGlobal('Translator', factory);
    return factory;
  };

  it('is unsupported when the API is missing', async () => {
    expect(isBrowserTranslatorSupported()).toBe(false);
    expect(await getBrowserTranslator('en', 'fr')).toBeNull();
  });

  it('creates a translator, reports download progress and caches it', async () => {
    const factory = stubTranslator('downloadable');
    const progress = vi.fn();
    const translator = await getBrowserTranslator('en', 'fr', progress);
    expect(await translator?.translate('Hi')).toBe('T:Hi');
    expect(progress.mock.calls).toEqual([[0.5], [1]]);
    await getBrowserTranslator('en', 'fr');
    expect(factory.create).toHaveBeenCalledTimes(1);
  });

  it('returns null for unavailable pairs', async () => {
    stubTranslator('unavailable');
    expect(await getBrowserTranslator('en', 'kn')).toBeNull();
  });

  it('asks for a click when the download needs user activation', async () => {
    stubTranslator('downloadable', async () => {
      throw new DOMException('needs gesture', 'NotAllowedError');
    });
    await expectCode(getBrowserTranslator('en', 'fr'), 'activationRequired');
  });

  it('falls back (null) when the model cannot be set up', async () => {
    const factory = stubTranslator('downloadable', async () => {
      throw new DOMException(
        'Unable to create translator',
        'NotSupportedError'
      );
    });
    expect(await getBrowserTranslator('en', 'fr')).toBeNull();
    // A failed attempt is not cached: the next request tries again.
    await getBrowserTranslator('en', 'fr');
    expect(factory.create).toHaveBeenCalledTimes(2);
  });

  it('treats an availability check that never answers as unavailable', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('Translator', {
      availability: vi.fn(() => new Promise(() => undefined)),
      create: vi.fn()
    });
    const promise = getBrowserTranslator('en', 'fr');
    await vi.advanceTimersByTimeAsync(AVAILABILITY_TIMEOUT_MS);
    expect(await promise).toBeNull();
  });

  it('abandons a model download that stops making progress', async () => {
    vi.useFakeTimers();
    let emit: (loaded: number) => void = () => undefined;
    let createSignal: AbortSignal | undefined;
    stubTranslator('downloadable', (options) => {
      const { monitor, signal } = options as {
        monitor?: (m: unknown) => void;
        signal?: AbortSignal;
      };
      createSignal = signal;
      monitor?.({
        addEventListener: (_: string, cb: (e: { loaded: number }) => void) =>
          (emit = (loaded) => cb({ loaded }))
      });
      return new Promise(() => undefined);
    });
    const progress = vi.fn();
    const promise = getBrowserTranslator('en', 'fr', progress);
    const settled = vi.fn();
    promise.then(settled, settled);

    // Progress keeps the download alive…
    await vi.advanceTimersByTimeAsync(MODEL_STALL_TIMEOUT_MS - 1000);
    emit(0.3);
    await vi.advanceTimersByTimeAsync(MODEL_STALL_TIMEOUT_MS - 1000);
    expect(settled).not.toHaveBeenCalled();
    expect(progress).toHaveBeenCalledWith(0.3);

    // …but a stall aborts it and the caller falls back online.
    await vi.advanceTimersByTimeAsync(1000);
    expect(await promise).toBeNull();
    expect(createSignal?.aborted).toBe(true);
  });

  const stubDetector = (
    results: { detectedLanguage: string; confidence: number }[]
  ) =>
    vi.stubGlobal('LanguageDetector', {
      availability: vi.fn(async () => 'available'),
      create: vi.fn(async () => ({ detect: vi.fn(async () => results) }))
    });

  it('detects languages on-device', async () => {
    stubDetector([{ detectedLanguage: 'fr', confidence: 0.934 }]);
    expect(await detectWithBrowser('Bonjour')).toEqual({
      language: 'fr',
      confidence: 93
    });
  });

  it('returns null when detection is unavailable', async () => {
    expect(await detectWithBrowser('Bonjour')).toBeNull();
  });

  it.each([
    [[{ detectedLanguage: 'fr', confidence: 0.2 }]],
    [[{ detectedLanguage: 'und', confidence: 0.9 }]],
    [[]]
  ])('rejects unreliable detections %j', async (results) => {
    stubDetector(results);
    await expectCode(detectWithBrowser('???'), 'detectionFailed');
  });
});

describe('languages', () => {
  it('provides localized, sorted names', () => {
    const languages = getLanguages('en');
    expect(languages.find((l) => l.code === 'de')?.name).toBe('German');
    const names = languages.map((l) => l.name);
    expect([...names].sort((a, b) => a.localeCompare(b, 'en'))).toEqual(names);
    expect(getLanguages('fr').find((l) => l.code === 'de')?.name).toBe(
      'Allemand'
    );
  });

  it.each([
    ['fr-FR', 'fr'],
    ['zh-TW', 'zh-Hant'],
    ['zh-Hans', 'zh'],
    ['iw', 'he'],
    ['nb', 'no'],
    ['xx', null]
  ])('normalizes %s → %s', (input, expected) => {
    expect(normalizeLanguageCode(input)).toBe(expected);
  });

  it('excludes the source from target options', () => {
    const languages = getLanguages('en');
    expect(getTargetOptions(languages, 'auto')).toBe(languages);
    expect(getTargetOptions(languages, 'en').some((l) => l.code === 'en')).toBe(
      false
    );
  });

  it('picks the UI language, then English, as default target', () => {
    const languages = getLanguages('en');
    expect(pickTarget(languages, '', 'fr-CA')).toBe('fr');
    expect(pickTarget(languages, '', 'xx')).toBe('en');
    expect(pickTarget(languages, 'de', 'fr')).toBe('de');
  });
});
