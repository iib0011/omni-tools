import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetBrowserEngine } from './engines/browserEngine';
import { TranslatorError } from './errors';
import {
  getPreferredEngine,
  translateDocument,
  translateText
} from './service';
import { TranslationProgress } from './types';

/*
 * External services are mocked: the browser's Translator/LanguageDetector
 * globals are stubbed, and `fetch` stands in for MyMemory.
 */

const fetchMock = vi.fn<Parameters<typeof fetch>, ReturnType<typeof fetch>>();

/** MyMemory stub: echoes `[source>target] text`. */
function myMemoryReplies(detected = 'fr') {
  fetchMock.mockImplementation(async (input) => {
    const params = new URL(String(input)).searchParams;
    const [source, target] = (params.get('langpair') ?? '').split('|');
    return new Response(
      JSON.stringify({
        responseData: {
          translatedText: `[${source}>${target}] ${params.get('q')}`,
          ...(source === 'autodetect' ? { detectedLanguage: detected } : {})
        },
        responseStatus: 200
      })
    );
  });
}

interface BrowserStubOptions {
  available?: (source: string, target: string) => boolean;
  detected?: { detectedLanguage: string; confidence: number } | null;
}

/** Built-in AI stub: translates to `<source>target> text`. */
function installBrowserAI({
  available = () => true,
  detected
}: BrowserStubOptions = {}) {
  const translate = vi.fn();
  vi.stubGlobal('Translator', {
    availability: vi.fn(async ({ sourceLanguage, targetLanguage }) =>
      available(sourceLanguage, targetLanguage) ? 'available' : 'unavailable'
    ),
    create: vi.fn(async ({ sourceLanguage, targetLanguage }) => ({
      translate: translate.mockImplementation(
        async (text: string) => `<${sourceLanguage}>${targetLanguage}> ${text}`
      )
    }))
  });
  if (detected !== null) {
    vi.stubGlobal('LanguageDetector', {
      availability: vi.fn(async () => 'available'),
      create: vi.fn(async () => ({
        detect: vi.fn(async () => [
          detected ?? { detectedLanguage: 'fr', confidence: 0.9 }
        ])
      }))
    });
  }
  return { translate };
}

async function expectCode(promise: Promise<unknown>, code: string) {
  const error = await promise.then(
    () => null,
    (e: unknown) => e
  );
  expect(error).toBeInstanceOf(TranslatorError);
  expect((error as TranslatorError).code).toBe(code);
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  resetBrowserEngine();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('engine selection', () => {
  it('prefers the on-device translator when the browser has one', () => {
    expect(getPreferredEngine()).toBe('mymemory');
    installBrowserAI();
    expect(getPreferredEngine()).toBe('browser');
  });
});

describe('translateText – on-device', () => {
  it('translates on the device without network requests', async () => {
    installBrowserAI();
    const result = await translateText('Hello', { source: 'en', target: 'es' });
    expect(result).toEqual({
      translatedText: '<en>es> Hello',
      engine: 'browser',
      detectedLanguage: undefined
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('detects the source language on the device', async () => {
    installBrowserAI({
      detected: { detectedLanguage: 'de', confidence: 0.97 }
    });
    const result = await translateText('Guten Tag', {
      source: 'auto',
      target: 'en'
    });
    expect(result.translatedText).toBe('<de>en> Guten Tag');
    expect(result.detectedLanguage).toEqual({ language: 'de', confidence: 97 });
  });

  it('rejects when the detected language equals the target', async () => {
    installBrowserAI({ detected: { detectedLanguage: 'en', confidence: 0.9 } });
    await expectCode(
      translateText('Hello', { source: 'auto', target: 'en' }),
      'sameLanguage'
    );
  });

  it('keeps line breaks, blank lines and indentation; translates duplicates once', async () => {
    const { translate } = installBrowserAI();
    const result = await translateText('Hi\n\n  Hi\r\nBye 123\n42', {
      source: 'en',
      target: 'fr'
    });
    expect(result.translatedText).toBe(
      '<en>fr> Hi\n\n  <en>fr> Hi\r\n<en>fr> Bye 123\n42'
    );
    expect(translate).toHaveBeenCalledTimes(2);
  });

  it('returns text without letters unchanged', async () => {
    installBrowserAI();
    const result = await translateText('123 456', {
      source: 'en',
      target: 'fr'
    });
    expect(result.translatedText).toBe('123 456');
  });
});

describe('translateText – MyMemory fallback', () => {
  it('uses MyMemory when the browser has no translator', async () => {
    myMemoryReplies();
    const result = await translateText('Hello', { source: 'en', target: 'es' });
    expect(result).toEqual({
      translatedText: '[en>es] Hello',
      engine: 'mymemory',
      detectedLanguage: undefined
    });
  });

  it('uses MyMemory for language pairs not available on the device', async () => {
    installBrowserAI({ available: (s, t) => !(s === 'en' && t === 'kn') });
    myMemoryReplies();
    const result = await translateText('Hello', { source: 'en', target: 'kn' });
    expect(result.engine).toBe('mymemory');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('uses MyMemory when the on-device model cannot be set up', async () => {
    installBrowserAI();
    vi.stubGlobal('Translator', {
      availability: vi.fn(async () => 'downloadable'),
      create: vi.fn(async () => {
        throw new DOMException(
          'Unable to create translator',
          'NotSupportedError'
        );
      })
    });
    myMemoryReplies();
    const result = await translateText('Hello', { source: 'en', target: 'fr' });
    expect(result).toMatchObject({
      translatedText: '[en>fr] Hello',
      engine: 'mymemory'
    });
  });

  it('detects online and reuses the detected language for later lines', async () => {
    myMemoryReplies('fr');
    const result = await translateText('Bonjour\nMerci', {
      source: 'auto',
      target: 'en'
    });
    expect(result.translatedText).toBe(
      '[autodetect>en] Bonjour\n[fr>en] Merci'
    );
    expect(result.detectedLanguage).toEqual({ language: 'fr' });
  });

  it('surfaces quota errors', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          responseData: { translatedText: 'x' },
          responseStatus: 200,
          quotaFinished: true
        })
      )
    );
    await expectCode(
      translateText('Hello', { source: 'en', target: 'es' }),
      'quotaExceeded'
    );
  });
});

describe('translateText – validation', () => {
  it.each([
    ['   ', 'en', 'es', 'emptyInput'],
    ['Hi', 'en', 'en', 'sameLanguage'],
    ['Hi', 'auto', '', 'unsupportedLanguage']
  ])('rejects %j %s→%s with %s', async (text, source, target, code) => {
    await expectCode(translateText(text, { source, target }), code);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('translateDocument', () => {
  it('translates a document on the device and reports progress', async () => {
    installBrowserAI();
    const file = new File(['Hello\n\nWorld\nHello\n'], 'notes.txt', {
      type: 'text/plain'
    });
    const progress: TranslationProgress[] = [];
    const result = await translateDocument(
      file,
      { source: 'en', target: 'de' },
      { onProgress: (p) => progress.push(p) }
    );

    expect(result.engine).toBe('browser');
    expect(result.file.name).toBe('notes.de.txt');
    expect(await result.file.text()).toBe(
      '<en>de> Hello\n\n<en>de> World\n<en>de> Hello\n'
    );
    expect(progress).toEqual([
      { phase: 'translating', done: 0, total: 2 },
      { phase: 'translating', done: 1, total: 2 },
      { phase: 'translating', done: 2, total: 2 }
    ]);
    // The original upload is untouched.
    expect(await file.text()).toBe('Hello\n\nWorld\nHello\n');
  });

  it('refuses documents larger than the online daily quota before sending anything', async () => {
    myMemoryReplies();
    const text = Array.from(
      { length: 80 },
      (_, i) => `Sentence number ${i} ${'x'.repeat(60)}`
    ).join('\n');
    const error = await translateDocument(new File([text], 'big.txt'), {
      source: 'en',
      target: 'es'
    }).catch((e: TranslatorError) => e);
    expect(error).toMatchObject({ code: 'documentTooLongForOnline' });
    expect(Number((error as TranslatorError).details)).toBeGreaterThan(5000);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('translates small documents online when needed', async () => {
    myMemoryReplies();
    const result = await translateDocument(new File(['<p>Hi</p>'], 'a.html'), {
      source: 'en',
      target: 'es'
    });
    expect(result.engine).toBe('mymemory');
    // Translated text is escaped when written back into HTML.
    expect(await result.file.text()).toBe('<p>[en&gt;es] Hi</p>');
  });

  it('reports documents without text', async () => {
    installBrowserAI();
    await expectCode(
      translateDocument(new File(['<p>123</p>'], 'a.html'), {
        source: 'en',
        target: 'es'
      }),
      'noTextFound'
    );
  });

  it('validates the file before reading it', async () => {
    await expectCode(
      translateDocument(new File(['x'], 'a.pdf'), {
        source: 'en',
        target: 'es'
      }),
      'unsupportedFormat'
    );
  });

  it('stops when cancelled', async () => {
    installBrowserAI();
    const controller = new AbortController();
    controller.abort();
    await expect(
      translateDocument(
        new File(['Hello'], 'a.txt'),
        { source: 'en', target: 'es' },
        { signal: controller.signal }
      )
    ).rejects.toMatchObject({ name: 'AbortError' });
  });
});
