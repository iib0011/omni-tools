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
import { resetBrowserEngine } from './engines/browserEngine';
import Translator from './index';

/*
 * No i18next instance is initialised in tests, so `t()` returns the key and
 * assertions use translation keys and test ids. The browser's built-in AI
 * APIs are stubbed, and `fetch` stands in for the MyMemory fallback.
 */

const fetchMock = vi.fn<Parameters<typeof fetch>, ReturnType<typeof fetch>>();
const showSnackBar = vi.fn();

type TranslateImpl = (
  text: string,
  source: string,
  target: string
) => Promise<string>;

function installBrowserAI({
  translate = async (text, source, target) => `<${source}>${target}> ${text}`,
  create
}: {
  translate?: TranslateImpl;
  create?: (options: { monitor?: (m: unknown) => void }) => Promise<unknown>;
} = {}) {
  vi.stubGlobal('Translator', {
    availability: vi.fn(async () => 'available'),
    create: vi.fn(
      create ??
        (async ({ sourceLanguage, targetLanguage }) => ({
          translate: (text: string) =>
            translate(text, sourceLanguage, targetLanguage)
        }))
    )
  });
  vi.stubGlobal('LanguageDetector', {
    availability: vi.fn(async () => 'available'),
    create: vi.fn(async () => ({
      detect: vi.fn(async () => [{ detectedLanguage: 'fr', confidence: 0.91 }])
    }))
  });
}

function myMemoryReplies() {
  fetchMock.mockImplementation(async (input) => {
    const params = new URL(String(input)).searchParams;
    return new Response(
      JSON.stringify({
        responseData: {
          translatedText: `[mm] ${params.get('q')}`,
          detectedLanguage: 'fr'
        },
        responseStatus: 200
      })
    );
  });
}

function renderTranslator() {
  return render(
    <CustomSnackBarContext.Provider value={{ showSnackBar }}>
      <Translator title="Translator" />
    </CustomSnackBarContext.Provider>
  );
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

const typeText = (value: string) =>
  fireEvent.change(screen.getByTestId('translator-input'), {
    target: { value }
  });

const clickTranslate = () =>
  fireEvent.click(screen.getByRole('button', { name: 'translator.translate' }));

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  showSnackBar.mockClear();
  resetBrowserEngine();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Translator – setup', () => {
  it('needs no server, URL or API key', () => {
    installBrowserAI();
    renderTranslator();
    expect(screen.queryByText(/server/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/api key/i)).not.toBeInTheDocument();
    expect(screen.getByTestId('translator-input')).toBeInTheDocument();
  });

  it('explains on-device translation when the browser supports it', () => {
    installBrowserAI();
    renderTranslator();
    expect(screen.getByTestId('translator-privacy')).toHaveTextContent(
      'translator.privacyOnDevice'
    );
  });

  it('explains the online fallback when the browser has no translator', () => {
    renderTranslator();
    expect(screen.getByTestId('translator-privacy')).toHaveTextContent(
      'translator.privacyOnline'
    );
  });
});

describe('Translator – text mode', () => {
  it('renders both areas with localized language names', () => {
    installBrowserAI();
    renderTranslator();
    expect(screen.getByTestId('translator-output')).toBeInTheDocument();
    expect(selectedLabel('translator-source-language')).toBe(
      'translator.autoDetect'
    );
    expect(selectedLabel('translator-target-language')).toBe('English');
    expect(screen.getByTestId('translator-char-count')).toHaveTextContent(
      'translator.characterCount'
    );
  });

  it('translates on the device with automatic detection', async () => {
    installBrowserAI();
    renderTranslator();
    await chooseLanguage('translator-target-language', 'Spanish');
    typeText('Bonjour');
    clickTranslate();

    await waitFor(() =>
      expect(screen.getByTestId('translator-output')).toHaveValue(
        '<fr>es> Bonjour'
      )
    );
    expect(screen.getByTestId('translator-engine')).toHaveTextContent(
      'translator.engineBrowser'
    );
    expect(screen.getByText('translator.detectedLanguage')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shows translation progress while working', async () => {
    let finish: (value: string) => void = () => undefined;
    installBrowserAI({
      translate: () => new Promise<string>((resolve) => (finish = resolve))
    });
    renderTranslator();
    typeText('Bonjour');
    clickTranslate();

    expect(
      await screen.findByRole('button', { name: 'translator.translating' })
    ).toBeDisabled();
    expect(
      await screen.findByText('translator.translatingProgress')
    ).toBeInTheDocument();

    await act(async () => finish('Hello'));
    await waitFor(() =>
      expect(screen.getByTestId('translator-output')).toHaveValue('Hello')
    );
  });

  it('shows language model download progress', async () => {
    installBrowserAI({
      create: ({ monitor }) => {
        monitor?.({
          addEventListener: (_: string, cb: (e: { loaded: number }) => void) =>
            cb({ loaded: 0.4 })
        });
        return new Promise(() => undefined);
      }
    });
    renderTranslator();
    typeText('Bonjour');
    clickTranslate();
    expect(
      await screen.findByText('translator.downloadingModel')
    ).toBeInTheDocument();
  });

  it('falls back to MyMemory when the browser has no translator', async () => {
    myMemoryReplies();
    renderTranslator();
    typeText('Bonjour');
    clickTranslate();
    await waitFor(() =>
      expect(screen.getByTestId('translator-output')).toHaveValue(
        '[mm] Bonjour'
      )
    );
    expect(screen.getByTestId('translator-engine')).toHaveTextContent(
      'translator.engineMyMemory'
    );
    expect(
      screen.getByText('translator.detectedLanguageNoConfidence')
    ).toBeInTheDocument();
  });

  it('shows errors such as an exhausted online quota', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          responseData: { translatedText: 'x' },
          responseStatus: 200,
          quotaFinished: true
        })
      )
    );
    renderTranslator();
    typeText('Hello');
    clickTranslate();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'translator.errors.quotaExceeded'
    );
  });

  it('disables translation for empty input and translates with Ctrl+Enter', async () => {
    installBrowserAI();
    renderTranslator();
    expect(
      screen.getByRole('button', { name: 'translator.translate' })
    ).toBeDisabled();
    typeText('Hola');
    fireEvent.keyDown(screen.getByTestId('translator-input'), {
      key: 'Enter',
      ctrlKey: true
    });
    await waitFor(() =>
      expect(screen.getByTestId('translator-output')).toHaveValue(
        '<fr>en> Hola'
      )
    );
  });

  it('swaps languages and texts, but not while detecting automatically', async () => {
    installBrowserAI();
    renderTranslator();
    const swap = screen.getByRole('button', {
      name: 'translator.swapLanguages'
    });
    expect(swap).toBeDisabled();

    await chooseLanguage('translator-source-language', 'English');
    await chooseLanguage('translator-target-language', 'Spanish');
    expect(swap).toBeEnabled();

    typeText('Hello');
    clickTranslate();
    await waitFor(() =>
      expect(screen.getByTestId('translator-output')).toHaveValue(
        '<en>es> Hello'
      )
    );
    fireEvent.click(swap);
    expect(selectedLabel('translator-source-language')).toBe('Spanish');
    expect(selectedLabel('translator-target-language')).toBe('English');
    expect(screen.getByTestId('translator-input')).toHaveValue('<en>es> Hello');
    expect(screen.getByTestId('translator-output')).toHaveValue('Hello');
  });

  it('copies the translation and clears both areas', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true
    });
    installBrowserAI();
    renderTranslator();
    typeText('Hello');
    clickTranslate();
    await waitFor(() =>
      expect(screen.getByTestId('translator-output')).not.toHaveValue('')
    );

    fireEvent.click(screen.getByRole('button', { name: 'resultFooter.copy' }));
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith('<fr>en> Hello')
    );
    expect(showSnackBar).toHaveBeenCalledWith('translator.copied', 'success');

    fireEvent.click(screen.getByRole('button', { name: 'inputFooter.clear' }));
    expect(screen.getByTestId('translator-input')).toHaveValue('');
    expect(screen.getByTestId('translator-output')).toHaveValue('');
  });
});

describe('Translator – document mode', () => {
  const openDocumentMode = async () => {
    renderTranslator();
    fireEvent.click(
      screen.getByRole('tab', { name: 'translator.documentMode' })
    );
    await screen.findByTestId('translator-dropzone');
  };

  const selectFile = (file: File) =>
    fireEvent.change(screen.getByTestId('translator-file-input'), {
      target: { files: [file] }
    });

  it('accepts only supported formats', async () => {
    installBrowserAI();
    await openDocumentMode();
    expect(screen.getByTestId('translator-file-input')).toHaveAttribute(
      'accept',
      '.txt,.srt,.html,.htm,.docx,.pptx,.odt,.odp,.epub'
    );
    selectFile(new File(['%PDF'], 'scan.pdf'));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'translator.errors.unsupportedFormat'
    );
    expect(
      screen.getByRole('button', { name: 'translator.translateDocument' })
    ).toBeDisabled();
  });

  it('accepts a dropped document and can remove it', async () => {
    installBrowserAI();
    await openDocumentMode();
    fireEvent.drop(screen.getByTestId('translator-dropzone'), {
      dataTransfer: { files: [new File(['Hello'], 'notes.txt')] }
    });
    expect(
      await screen.findByTestId('translator-selected-file')
    ).toHaveTextContent('notes.txt');
    fireEvent.click(screen.getByRole('button', { name: 'inputFooter.clear' }));
    expect(
      screen.queryByTestId('translator-selected-file')
    ).not.toBeInTheDocument();
  });

  it('translates a document in the browser and downloads it', async () => {
    installBrowserAI();
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
    await chooseLanguage('translator-target-language', 'German');
    selectFile(new File(['Bonjour\n'], 'notes.txt', { type: 'text/plain' }));
    await screen.findByTestId('translator-selected-file');
    fireEvent.click(
      screen.getByRole('button', { name: 'translator.translateDocument' })
    );

    expect(
      await screen.findByTestId('translator-result-file')
    ).toHaveTextContent('notes.de.txt');
    expect(screen.getByTestId('translator-engine')).toHaveTextContent(
      'translator.engineBrowser'
    );
    expect(showSnackBar).toHaveBeenCalledWith(
      'translator.documentTranslated',
      'success'
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'translator.downloadDocument' })
    );
    const downloaded = (createObjectURL.mock.calls[0] as unknown[])[0] as File;
    expect(downloaded.name).toBe('notes.de.txt');
    expect(await downloaded.text()).toBe('<fr>de> Bonjour\n');
    expect(click).toHaveBeenCalled();
    await waitFor(() =>
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:translated')
    );
  });

  it('reports corrupt documents', async () => {
    installBrowserAI();
    await openDocumentMode();
    selectFile(new File(['not a zip'], 'broken.docx'));
    await screen.findByTestId('translator-selected-file');
    fireEvent.click(
      screen.getByRole('button', { name: 'translator.translateDocument' })
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'translator.errors.corruptDocument'
    );
    expect(
      screen.getByRole('button', { name: 'translator.downloadDocument' })
    ).toBeDisabled();
  });

  it('blocks documents too long for the online fallback', async () => {
    myMemoryReplies();
    await openDocumentMode();
    const text = Array.from(
      { length: 100 },
      (_, i) => `Line ${i} ${'x'.repeat(60)}`
    ).join('\n');
    selectFile(new File([text], 'long.txt'));
    await screen.findByTestId('translator-selected-file');
    fireEvent.click(
      screen.getByRole('button', { name: 'translator.translateDocument' })
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'translator.errors.documentTooLongForOnline'
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
