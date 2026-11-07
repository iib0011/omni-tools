import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react';
import { CustomSnackBarContext } from '../../../../contexts/CustomSnackBarContext';
import Translator from './index';

/*
 * No i18next instance is initialised in tests, so `t()` returns the key.
 * Assertions therefore use translation keys and test ids.
 */

const SERVER = 'https://translate.example.com';

const LANGUAGES = [
  { code: 'en', name: 'English', targets: ['es', 'fr'] },
  { code: 'es', name: 'Spanish', targets: ['en', 'fr'] },
  { code: 'fr', name: 'French', targets: ['en', 'es'] }
];

const DEFAULT_SETTINGS = {
  charLimit: 50,
  keyRequired: false,
  filesTranslation: true,
  supportedFilesFormat: ['.txt', '.docx', '.pdf']
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });

type Handler = (init?: RequestInit) => Promise<Response> | Response;

let handlers: Record<string, Handler>;
const fetchMock = vi.fn(
  async (input: RequestInfo | URL, init?: RequestInit) => {
    const path = String(input).replace(SERVER, '');
    const handler = handlers[path];
    if (!handler) return jsonResponse({ error: 'Not Found' }, 404);
    return handler(init);
  }
);

const showSnackBar = vi.fn();

function renderTranslator() {
  return render(
    <CustomSnackBarContext.Provider value={{ showSnackBar }}>
      <Translator title="Translator" />
    </CustomSnackBarContext.Provider>
  );
}

async function renderConnected() {
  const view = renderTranslator();
  await screen.findByText('translator.connected');
  return view;
}

/** Opens an MUI Select by id and picks the option with the given label. */
async function chooseLanguage(selectId: string, optionLabel: string) {
  const select = document.getElementById(selectId);
  if (!select) throw new Error(`Select ${selectId} not found`);
  fireEvent.mouseDown(select);
  const listbox = await screen.findByRole('listbox');
  fireEvent.click(within(listbox).getByText(optionLabel));
  await waitFor(() =>
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  );
}

const selectedLabel = (selectId: string) =>
  document.getElementById(selectId)?.textContent;

const translateCalls = () =>
  fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/translate'));

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem(
    'translator.libretranslate',
    JSON.stringify({ serverUrl: SERVER, apiKey: '' })
  );
  handlers = {
    '/languages': () => jsonResponse(LANGUAGES),
    '/frontend/settings': () => jsonResponse(DEFAULT_SETTINGS)
  };
  fetchMock.mockClear();
  showSnackBar.mockClear();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Translator – setup', () => {
  it('asks for a server when none is configured and disables translation', () => {
    localStorage.clear();
    renderTranslator();
    expect(screen.getByText('translator.notConfigured')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'translator.translate' })
    ).toBeDisabled();
    expect(screen.queryByTestId('translator-privacy')).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('loads languages from the configured server and shows the privacy notice', async () => {
    await renderConnected();
    expect(fetchMock).toHaveBeenCalledWith(
      `${SERVER}/languages`,
      expect.anything()
    );
    expect(screen.getByTestId('translator-privacy')).toHaveTextContent(
      'translator.privacyNotice'
    );
  });

  it('connects to a newly entered server and saves it', async () => {
    localStorage.clear();
    renderTranslator();
    fireEvent.change(screen.getByTestId('translator-server-url'), {
      target: { value: `${SERVER}/` }
    });
    fireEvent.click(screen.getByRole('button', { name: 'translator.connect' }));
    await screen.findByText('translator.connected');
    expect(
      JSON.parse(localStorage.getItem('translator.libretranslate') ?? '{}')
    ).toEqual({ serverUrl: `${SERVER}/`, apiKey: '' });
  });

  it('shows a connection error for an unreachable server', async () => {
    handlers['/languages'] = () => {
      throw new TypeError('Failed to fetch');
    };
    renderTranslator();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'translator.errors.network'
    );
  });
});

describe('Translator – text mode', () => {
  it('renders both translation areas and the character count', async () => {
    await renderConnected();
    expect(screen.getByTestId('translator-input')).toBeInTheDocument();
    expect(screen.getByTestId('translator-output')).toBeInTheDocument();
    expect(screen.getByTestId('translator-char-count')).toHaveTextContent(
      'translator.characterCountWithLimit'
    );
    expect(selectedLabel('translator-source-language')).toBe(
      'translator.autoDetect'
    );
    // Default target follows the UI language, falling back to English.
    expect(selectedLabel('translator-target-language')).toBe('English');
  });

  it('translates text with automatic detection', async () => {
    let resolveTranslation: (response: Response) => void = () => undefined;
    handlers['/translate'] = () =>
      new Promise<Response>((resolve) => {
        resolveTranslation = resolve;
      });
    await renderConnected();
    await chooseLanguage('translator-target-language', 'Spanish');

    fireEvent.change(screen.getByTestId('translator-input'), {
      target: { value: 'Bonjour' }
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'translator.translate' })
    );

    // Loading state
    expect(
      await screen.findByRole('button', { name: 'translator.translating' })
    ).toBeDisabled();
    expect(screen.queryByTestId('translator-output')).not.toBeInTheDocument();

    const body = JSON.parse(String(translateCalls()[0][1]?.body));
    expect(body).toMatchObject({ q: 'Bonjour', source: 'auto', target: 'es' });

    await act(async () =>
      resolveTranslation(
        jsonResponse({
          translatedText: 'Hola',
          detectedLanguage: { language: 'fr', confidence: 92 }
        })
      )
    );

    expect(await screen.findByTestId('translator-output')).toHaveValue('Hola');
    expect(screen.getByText('translator.detectedLanguage')).toBeInTheDocument();
  });

  it('translates with Ctrl+Enter', async () => {
    handlers['/translate'] = () => jsonResponse({ translatedText: 'Hi' });
    await renderConnected();
    const input = screen.getByTestId('translator-input');
    fireEvent.change(input, { target: { value: 'Hola' } });
    fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true });
    await waitFor(() =>
      expect(screen.getByTestId('translator-output')).toHaveValue('Hi')
    );
  });

  it('disables translation for empty input or text over the limit', async () => {
    await renderConnected();
    const button = screen.getByRole('button', { name: 'translator.translate' });
    expect(button).toBeDisabled();

    fireEvent.change(screen.getByTestId('translator-input'), {
      target: { value: 'x'.repeat(DEFAULT_SETTINGS.charLimit + 1) }
    });
    expect(button).toBeDisabled();

    fireEvent.change(screen.getByTestId('translator-input'), {
      target: { value: 'ok' }
    });
    expect(button).toBeEnabled();
  });

  it('shows API errors', async () => {
    handlers['/translate'] = () =>
      jsonResponse({ error: 'Slowdown: 20 per 1 minute' }, 429);
    await renderConnected();
    fireEvent.change(screen.getByTestId('translator-input'), {
      target: { value: 'Hello' }
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'translator.translate' })
    );

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('translator.errors.rateLimited');
    expect(alert).toHaveTextContent('translator.errorDetails');
  });

  it('swaps languages and texts, but not while detecting automatically', async () => {
    handlers['/translate'] = () => jsonResponse({ translatedText: 'Hola' });
    await renderConnected();
    const swap = screen.getByRole('button', {
      name: 'translator.swapLanguages'
    });
    expect(swap).toBeDisabled();

    await chooseLanguage('translator-source-language', 'English');
    await chooseLanguage('translator-target-language', 'Spanish');
    expect(swap).toBeEnabled();

    fireEvent.change(screen.getByTestId('translator-input'), {
      target: { value: 'Hello' }
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'translator.translate' })
    );
    await waitFor(() =>
      expect(screen.getByTestId('translator-output')).toHaveValue('Hola')
    );

    fireEvent.click(swap);
    expect(selectedLabel('translator-source-language')).toBe('Spanish');
    expect(selectedLabel('translator-target-language')).toBe('English');
    expect(screen.getByTestId('translator-input')).toHaveValue('Hola');
    expect(screen.getByTestId('translator-output')).toHaveValue('Hello');
  });

  it('copies the translation and clears both areas', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true
    });
    handlers['/translate'] = () => jsonResponse({ translatedText: 'Hola' });
    await renderConnected();
    fireEvent.change(screen.getByTestId('translator-input'), {
      target: { value: 'Hello' }
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'translator.translate' })
    );
    await waitFor(() =>
      expect(screen.getByTestId('translator-output')).toHaveValue('Hola')
    );

    fireEvent.click(screen.getByRole('button', { name: 'resultFooter.copy' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('Hola'));
    expect(showSnackBar).toHaveBeenCalledWith('translator.copied', 'success');

    fireEvent.click(screen.getByRole('button', { name: 'inputFooter.clear' }));
    expect(screen.getByTestId('translator-input')).toHaveValue('');
    expect(screen.getByTestId('translator-output')).toHaveValue('');
  });
});

describe('Translator – document mode', () => {
  const openDocumentMode = async () => {
    await renderConnected();
    fireEvent.click(
      screen.getByRole('tab', { name: 'translator.documentMode' })
    );
    await screen.findByTestId('translator-dropzone');
  };

  const selectFile = (file: File) =>
    fireEvent.change(screen.getByTestId('translator-file-input'), {
      target: { files: [file] }
    });

  it('restricts the picker to the formats the server supports', async () => {
    await openDocumentMode();
    expect(screen.getByTestId('translator-file-input')).toHaveAttribute(
      'accept',
      '.txt,.docx,.pdf'
    );
  });

  it('rejects unsupported files', async () => {
    await openDocumentMode();
    selectFile(new File(['x'], 'slides.pptx'));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'translator.errors.unsupportedFormat'
    );
    expect(
      screen.getByRole('button', { name: 'translator.translateDocument' })
    ).toBeDisabled();
  });

  it('accepts a dropped document', async () => {
    await openDocumentMode();
    fireEvent.drop(screen.getByTestId('translator-dropzone'), {
      dataTransfer: { files: [new File(['Hello'], 'notes.txt')] }
    });
    expect(
      await screen.findByTestId('translator-selected-file')
    ).toHaveTextContent('notes.txt');
  });

  it('translates a document and downloads the result', async () => {
    handlers['/translate_file'] = () =>
      jsonResponse({
        translatedFileUrl: `${SERVER}/download_file/abc.notes.txt`
      });
    handlers['/download_file/abc.notes.txt'] = () => new Response('Hola');
    const createObjectURL = vi.fn(() => 'blob:translated');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal(
      'URL',
      Object.assign(URL, { createObjectURL, revokeObjectURL })
    );
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    await openDocumentMode();
    selectFile(new File(['Hello'], 'notes.txt', { type: 'text/plain' }));
    expect(
      await screen.findByTestId('translator-selected-file')
    ).toHaveTextContent('notes.txt');

    fireEvent.click(
      screen.getByRole('button', { name: 'translator.translateDocument' })
    );
    expect(
      await screen.findByText('translator.translatingDocument')
    ).toBeInTheDocument();

    expect(
      await screen.findByTestId('translator-result-file')
    ).toHaveTextContent('notes.en.txt');
    expect(showSnackBar).toHaveBeenCalledWith(
      'translator.documentTranslated',
      'success'
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'translator.downloadDocument' })
    );
    expect(createObjectURL).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'notes.en.txt' })
    );
    expect(click).toHaveBeenCalled();
    await waitFor(() =>
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:translated')
    );
  });

  it('shows document translation failures', async () => {
    handlers['/translate_file'] = () =>
      jsonResponse({ error: 'Corrupted file' }, 500);
    await openDocumentMode();
    selectFile(new File(['%PDF-broken'], 'broken.pdf'));
    await screen.findByTestId('translator-selected-file');
    fireEvent.click(
      screen.getByRole('button', { name: 'translator.translateDocument' })
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'translator.errors.serverError'
    );
    expect(
      screen.getByRole('button', { name: 'translator.downloadDocument' })
    ).toBeDisabled();
  });

  it('removes the selected file', async () => {
    await openDocumentMode();
    selectFile(new File(['Hello'], 'notes.txt'));
    await screen.findByTestId('translator-selected-file');
    fireEvent.click(screen.getByRole('button', { name: 'inputFooter.clear' }));
    expect(
      screen.queryByTestId('translator-selected-file')
    ).not.toBeInTheDocument();
  });

  it('explains when the server has document translation disabled', async () => {
    handlers['/frontend/settings'] = () =>
      jsonResponse({ ...DEFAULT_SETTINGS, filesTranslation: false });
    await openDocumentMode();
    expect(
      screen.getByText('translator.filesDisabledOnServer')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'translator.translateDocument' })
    ).toBeDisabled();
  });
});
