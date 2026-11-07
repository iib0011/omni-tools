import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildTranslatedFileName,
  fetchLanguages,
  fetchServerSettings,
  loadConfig,
  normalizeServerUrl,
  resolveDownloadUrl,
  saveConfig,
  TEXT_TIMEOUT_MS,
  translateDocument,
  translateText,
  TranslatorError
} from './service';
import { TranslatorConfig } from './types';

const SERVER = 'https://translate.example.com';
const config: TranslatorConfig = { serverUrl: SERVER, apiKey: '' };
const configWithKey: TranslatorConfig = { serverUrl: SERVER, apiKey: 'k-123' };

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });

const fetchMock = vi.fn<Parameters<typeof fetch>, ReturnType<typeof fetch>>();

/** Asserts that `promise` rejects with a TranslatorError of the given code. */
async function expectCode(promise: Promise<unknown>, code: string) {
  await expect(promise).rejects.toBeInstanceOf(TranslatorError);
  await promise.catch((error: TranslatorError) =>
    expect(error.code).toBe(code)
  );
}

const lastRequestBody = () =>
  JSON.parse(String(fetchMock.mock.calls.at(-1)?.[1]?.body));

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('normalizeServerUrl', () => {
  it('strips trailing slashes and keeps sub-paths', () => {
    expect(normalizeServerUrl(' https://x.org/ ')).toBe('https://x.org');
    expect(normalizeServerUrl('http://x.org/lt//')).toBe('http://x.org/lt');
  });

  it('requires a URL', () => {
    expect(() => normalizeServerUrl('  ')).toThrow(
      expect.objectContaining({ code: 'notConfigured' })
    );
  });

  it.each([
    'not a url',
    'ftp://x.org',
    'javascript:alert(1)',
    'https://x.org/?a=1',
    'https://user:pw@x.org'
  ])('rejects %s', (value) => {
    expect(() => normalizeServerUrl(value)).toThrow(
      expect.objectContaining({ code: 'invalidServerUrl' })
    );
  });
});

describe('config persistence', () => {
  it('falls back to build-time defaults when nothing is saved', () => {
    expect(loadConfig()).toEqual({
      serverUrl: import.meta.env.VITE_LIBRETRANSLATE_URL ?? '',
      apiKey: import.meta.env.VITE_LIBRETRANSLATE_API_KEY ?? ''
    });
  });

  it('round-trips saved settings', () => {
    saveConfig(configWithKey);
    expect(loadConfig()).toEqual(configWithKey);
  });

  it('ignores corrupt stored data', () => {
    localStorage.setItem('translator.libretranslate', '{oops');
    expect(loadConfig().serverUrl).toBe(
      import.meta.env.VITE_LIBRETRANSLATE_URL ?? ''
    );
  });
});

describe('fetchLanguages', () => {
  it('returns valid languages sorted by name', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse([
        { code: 'fr', name: 'French', targets: ['en'] },
        { code: 'en', name: 'English', targets: ['fr', 42] },
        { code: 1, name: 'broken' }
      ])
    );
    const languages = await fetchLanguages(config);
    expect(fetchMock.mock.calls[0][0]).toBe(`${SERVER}/languages`);
    expect(languages).toEqual([
      { code: 'en', name: 'English', targets: ['fr'] },
      { code: 'fr', name: 'French', targets: ['en'] }
    ]);
  });

  it('rejects non-array responses', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ hello: 'world' }));
    await expectCode(fetchLanguages(config), 'invalidResponse');
  });

  it('rejects non-JSON responses', async () => {
    fetchMock.mockResolvedValue(new Response('<html>proxy</html>'));
    await expectCode(fetchLanguages(config), 'invalidResponse');
  });

  it('reports a missing server URL without making a request', async () => {
    await expectCode(
      fetchLanguages({ serverUrl: '', apiKey: '' }),
      'notConfigured'
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('fetchServerSettings', () => {
  it('maps the server capabilities', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        charLimit: 5000,
        keyRequired: true,
        filesTranslation: true,
        supportedFilesFormat: ['.TXT', '.pdf']
      })
    );
    expect(await fetchServerSettings(config)).toEqual({
      charLimit: 5000,
      keyRequired: true,
      filesTranslation: true,
      supportedFilesFormat: ['.txt', '.pdf']
    });
  });

  it('returns null when the endpoint does not exist', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: 'Not found' }, 404));
    expect(await fetchServerSettings(config)).toBeNull();
  });
});

describe('translateText', () => {
  it('translates text and sends the expected request', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ translatedText: '¡Hola!' }));
    const result = await translateText(config, {
      text: 'Hello!',
      source: 'en',
      target: 'es'
    });

    expect(result).toEqual({
      translatedText: '¡Hola!',
      detectedLanguage: undefined
    });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${SERVER}/translate`);
    expect(init?.method).toBe('POST');
    expect(lastRequestBody()).toEqual({
      q: 'Hello!',
      source: 'en',
      target: 'es',
      format: 'text'
    });
  });

  it('includes the API key only when configured', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ translatedText: 'x' }));
    await translateText(configWithKey, {
      text: 'a',
      source: 'en',
      target: 'es'
    });
    expect(lastRequestBody().api_key).toBe('k-123');
  });

  it('returns the detected language for automatic detection', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        translatedText: 'Hello!',
        detectedLanguage: { confidence: 90, language: 'fr' }
      })
    );
    const result = await translateText(config, {
      text: 'Bonjour !',
      source: 'auto',
      target: 'en'
    });
    expect(lastRequestBody().source).toBe('auto');
    expect(result.detectedLanguage).toEqual({ language: 'fr', confidence: 90 });
  });

  it('rejects empty input without calling the server', async () => {
    await expectCode(
      translateText(config, { text: '   ', source: 'en', target: 'es' }),
      'emptyInput'
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects identical source and target languages', async () => {
    await expectCode(
      translateText(config, { text: 'a', source: 'en', target: 'en' }),
      'sameLanguage'
    );
  });

  it('rejects a missing target language', async () => {
    await expectCode(
      translateText(config, { text: 'a', source: 'auto', target: '' }),
      'unsupportedLanguage'
    );
  });

  it.each([
    [400, { error: 'xx is not supported' }, config, 'unsupportedLanguage'],
    [
      400,
      { error: 'Invalid request: request (6000) exceeds text limit (5000)' },
      config,
      'textTooLong'
    ],
    [
      400,
      { error: 'Please contact the server operator to get an API key' },
      config,
      'keyRequired'
    ],
    [403, { error: 'Invalid API key' }, configWithKey, 'invalidKey'],
    [403, { error: 'Forbidden' }, config, 'keyRequired'],
    [429, { error: 'Slowdown: 20 per 1 minute' }, config, 'rateLimited'],
    [500, { error: 'boom' }, config, 'serverError'],
    [502, '<html>Bad gateway</html>', config, 'serverError'],
    [404, { error: 'Not Found' }, config, 'endpointNotFound'],
    [400, { error: 'Something else' }, config, 'badRequest']
  ])('maps HTTP %i %j to %s', async (status, body, cfg, expectedCode) => {
    fetchMock.mockResolvedValue(
      typeof body === 'string'
        ? new Response(body, { status })
        : jsonResponse(body, status)
    );
    await expectCode(
      translateText(cfg, { text: 'a', source: 'en', target: 'es' }),
      expectedCode
    );
  });

  it('exposes the server error message', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: 'Slowdown: 20 per 1 minute' }, 429)
    );
    await translateText(config, { text: 'a', source: 'en', target: 'es' })
      .then(() => expect.fail('should reject'))
      .catch((error: TranslatorError) => {
        expect(error.status).toBe(429);
        expect(error.serverMessage).toBe('Slowdown: 20 per 1 minute');
      });
  });

  it('reports network failures', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    await expectCode(
      translateText(config, { text: 'a', source: 'en', target: 'es' }),
      'network'
    );
  });

  it('rejects responses without translatedText', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ translation: 'nope' }));
    await expectCode(
      translateText(config, { text: 'a', source: 'en', target: 'es' }),
      'invalidResponse'
    );
  });

  it('times out slow requests', async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(new DOMException('aborted', 'AbortError'))
          );
        })
    );
    const promise = translateText(config, {
      text: 'a',
      source: 'en',
      target: 'es'
    });
    vi.advanceTimersByTime(TEXT_TIMEOUT_MS);
    await expectCode(promise, 'timeout');
  });

  it('re-throws AbortError when the caller cancels', async () => {
    fetchMock.mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(new DOMException('aborted', 'AbortError'))
          );
        })
    );
    const controller = new AbortController();
    const promise = translateText(
      config,
      { text: 'a', source: 'en', target: 'es' },
      controller.signal
    );
    controller.abort();
    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
  });
});

describe('resolveDownloadUrl', () => {
  it('keeps same-origin URLs', () => {
    expect(resolveDownloadUrl(SERVER, `${SERVER}/download_file/abc.docx`)).toBe(
      `${SERVER}/download_file/abc.docx`
    );
  });

  it('re-bases URLs built with an internal host onto the configured server', () => {
    expect(
      resolveDownloadUrl(
        `${SERVER}/lt/`,
        'http://127.0.0.1:5000/download_file/abc.docx'
      )
    ).toBe(`${SERVER}/lt/download_file/abc.docx`);
  });

  it('resolves relative URLs', () => {
    expect(resolveDownloadUrl(SERVER, '/download_file/abc.txt')).toBe(
      `${SERVER}/download_file/abc.txt`
    );
  });

  it.each([
    'javascript:alert(1)',
    'https://evil.example.org/malware.exe',
    'data:text/html,hi'
  ])('rejects %s', (value) => {
    expect(() => resolveDownloadUrl(SERVER, value)).toThrow(
      expect.objectContaining({ code: 'invalidResponse' })
    );
  });
});

describe('buildTranslatedFileName', () => {
  it.each([
    ['report.docx', 'es', 'report.es.docx'],
    ['my.notes.v2.pdf', 'fr', 'my.notes.v2.fr.pdf'],
    ['README', 'de', 'README.de']
  ])('%s → %s', (name, target, expected) => {
    expect(buildTranslatedFileName(name, target)).toBe(expected);
  });
});

describe('translateDocument', () => {
  const makeFile = (name = 'report.txt', content = 'Hello world') =>
    new File([content], name, { type: 'text/plain' });

  it('uploads the document and downloads the translation', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          translatedFileUrl: `${SERVER}/download_file/uuid.report.txt`
        })
      )
      .mockResolvedValueOnce(new Response('Hola mundo'));

    const file = makeFile();
    const result = await translateDocument(configWithKey, {
      file,
      source: 'auto',
      target: 'es'
    });

    const [uploadUrl, uploadInit] = fetchMock.mock.calls[0];
    expect(uploadUrl).toBe(`${SERVER}/translate_file`);
    expect(uploadInit?.method).toBe('POST');
    const form = uploadInit?.body as FormData;
    expect(form.get('source')).toBe('auto');
    expect(form.get('target')).toBe('es');
    expect(form.get('api_key')).toBe('k-123');
    expect((form.get('file') as File).name).toBe('report.txt');

    expect(fetchMock.mock.calls[1][0]).toBe(
      `${SERVER}/download_file/uuid.report.txt`
    );
    expect(result.name).toBe('report.es.txt');
    expect(result.type).toBe('text/plain');
    expect(await result.text()).toBe('Hola mundo');
    // The uploaded file is left untouched.
    expect(file.name).toBe('report.txt');
    expect(await file.text()).toBe('Hello world');
  });

  it('does not send an API key when none is configured', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ translatedFileUrl: `${SERVER}/download_file/a.txt` })
      )
      .mockResolvedValueOnce(new Response('x'));
    await translateDocument(config, {
      file: makeFile(),
      source: 'en',
      target: 'es'
    });
    expect((fetchMock.mock.calls[0][1]?.body as FormData).has('api_key')).toBe(
      false
    );
  });

  it('rejects empty files without calling the server', async () => {
    await expectCode(
      translateDocument(config, {
        file: makeFile('empty.txt', ''),
        source: 'en',
        target: 'es'
      }),
      'emptyFile'
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    [400, 'Invalid request: file format not supported', 'unsupportedFormat'],
    [403, 'Files translation are disabled on this server.', 'filesDisabled'],
    [500, 'Corrupted document', 'serverError']
  ])('maps upload failure %i "%s" to %s', async (status, error, code) => {
    fetchMock.mockResolvedValue(jsonResponse({ error }, status));
    await expectCode(
      translateDocument(config, {
        file: makeFile(),
        source: 'en',
        target: 'es'
      }),
      code
    );
  });

  it('rejects an upload response without a file URL', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));
    await expectCode(
      translateDocument(config, {
        file: makeFile(),
        source: 'en',
        target: 'es'
      }),
      'invalidResponse'
    );
  });

  it('reports a failed download of the translated file', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ translatedFileUrl: `${SERVER}/download_file/a.txt` })
      )
      .mockResolvedValueOnce(new Response('gone', { status: 404 }));
    await expectCode(
      translateDocument(config, {
        file: makeFile(),
        source: 'en',
        target: 'es'
      }),
      'downloadFailed'
    );
  });

  it('reports a network error during download as downloadFailed', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ translatedFileUrl: `${SERVER}/download_file/a.txt` })
      )
      .mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expectCode(
      translateDocument(config, {
        file: makeFile(),
        source: 'en',
        target: 'es'
      }),
      'downloadFailed'
    );
  });

  it('refuses to download from an unrelated host', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ translatedFileUrl: 'https://evil.example.org/x.txt' })
    );
    await expectCode(
      translateDocument(config, {
        file: makeFile(),
        source: 'en',
        target: 'es'
      }),
      'invalidResponse'
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
