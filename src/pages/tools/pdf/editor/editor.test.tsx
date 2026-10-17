import { fireEvent, render, screen } from '@testing-library/react';
import PdfEditor from './index';

// Stand-in for the SimplePDF iframe: rendering it must be the only way the
// third-party editor (and therefore its network traffic) can be reached.
// A <div> is used so happy-dom does not try to fetch a real iframe page.
vi.mock('@simplepdf/react-embed-pdf', () => ({
  EmbedPDF: () => <div data-testid="simplepdf-iframe" />
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

// Collects every absolute http(s) URL the rendered DOM would make the browser
// load on its own (iframes, scripts, images, stylesheets, embeds).
const remoteResourceUrls = (root: HTMLElement): string[] =>
  Array.from(
    root.querySelectorAll<HTMLElement>(
      'iframe[src], script[src], img[src], link[href][rel="stylesheet"], embed[src], object[data]'
    )
  )
    .map((el) => el.getAttribute('src') ?? el.getAttribute('href') ?? '')
    .filter((url) => /^https?:\/\//i.test(url));

describe('PdfEditor third-party consent (#301)', () => {
  const fetchSpy = vi.fn();
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    fetchSpy.mockReset();
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test('loads no remote resource and makes no request before opt-in', () => {
    const { container } = render(<PdfEditor title="PDF Editor" />);

    expect(screen.getByTestId('simplepdf-consent')).toBeInTheDocument();
    expect(screen.queryByTestId('simplepdf-iframe')).not.toBeInTheDocument();
    expect(remoteResourceUrls(container)).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test('loads the SimplePDF editor only after explicit opt-in', () => {
    render(<PdfEditor title="PDF Editor" />);

    fireEvent.click(
      screen.getByRole('button', { name: 'editor.thirdParty.accept' })
    );

    expect(screen.queryByTestId('simplepdf-consent')).not.toBeInTheDocument();
    expect(screen.getByTestId('simplepdf-iframe')).toBeInTheDocument();
  });

  test('consent is not persisted across mounts', () => {
    const first = render(<PdfEditor title="PDF Editor" />);
    fireEvent.click(
      screen.getByRole('button', { name: 'editor.thirdParty.accept' })
    );
    first.unmount();

    render(<PdfEditor title="PDF Editor" />);
    expect(screen.getByTestId('simplepdf-consent')).toBeInTheDocument();
    expect(screen.queryByTestId('simplepdf-iframe')).not.toBeInTheDocument();
  });
});
