import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  PDFPageProxy,
  RenderTask
} from 'pdfjs-dist';
import { getPdfJs } from '../../../../lib/pdf-workbench/pdfjs';
import {
  createBlankPageFingerprint,
  createPdfThumbnailRenderer,
  createRenderedPageFingerprint
} from './thumbnail-service';
import type { OrganizerPage, OrganizerSourcePage } from './types';

vi.mock('../../../../lib/pdf-workbench/pdfjs', () => ({
  getPdfJs: vi.fn()
}));

interface FakePageSpec {
  marker: number;
  text?: string;
  waitForCancel?: boolean;
}

interface FakePageRecord {
  cleanup: ReturnType<typeof vi.fn>;
  renderCancel: ReturnType<typeof vi.fn<[], void>>;
  renderStarted: Promise<void>;
}

interface FakeDocumentRecord {
  document: PDFDocumentProxy;
  pages: FakePageRecord[];
}

const canvasMarkers = new WeakMap<HTMLCanvasElement, number>();
const renderedCanvases: HTMLCanvasElement[] = [];

const installCanvasContext = () => {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value: function (this: HTMLCanvasElement) {
      return {
        getImageData: (
          _x: number,
          _y: number,
          width: number,
          height: number
        ) => ({
          data: makePixels(width, height, canvasMarkers.get(this) ?? 0),
          height,
          width
        })
      } as unknown as CanvasRenderingContext2D;
    }
  });
};

const makePixels = (
  width: number,
  height: number,
  marker: number
): Uint8ClampedArray => {
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let index = 0; index < pixels.length; index += 4) {
    pixels[index] = marker;
    pixels[index + 1] = (marker * 3) % 256;
    pixels[index + 2] = (marker * 7) % 256;
    pixels[index + 3] = 255;
  }
  return pixels;
};

const createFakeDocument = (specs: FakePageSpec[]): FakeDocumentRecord => {
  const pages = specs.map((spec) => {
    let signalRenderStarted: () => void = () => undefined;
    const renderStarted = new Promise<void>((resolve) => {
      signalRenderStarted = resolve;
    });
    const cleanup = vi.fn();
    let rejectRender: (error: Error) => void = () => undefined;
    const renderCancel = vi.fn(() => {
      rejectRender(new Error('render cancelled'));
    });
    const page = {
      cleanup,
      getTextContent: vi.fn(async () => ({
        items: spec.text ? [{ str: spec.text }] : []
      })),
      getViewport: vi.fn(({ scale }: { scale: number }) => ({
        height: 300 * scale,
        width: 200 * scale
      })),
      render: vi.fn(({ canvas }: { canvas: HTMLCanvasElement }) => {
        canvasMarkers.set(canvas, spec.marker);
        renderedCanvases.push(canvas);
        signalRenderStarted();
        const promise = spec.waitForCancel
          ? new Promise<void>((_resolve, reject) => {
              rejectRender = reject;
            })
          : Promise.resolve();
        return { cancel: renderCancel, promise } as unknown as RenderTask;
      }),
      rotate: 0,
      view: [0, 0, 200, 300]
    } as unknown as PDFPageProxy;
    return { cleanup, page, renderCancel, renderStarted };
  });

  return {
    document: {
      getPage: vi.fn(async (pageNumber: number) => pages[pageNumber - 1].page),
      numPages: pages.length
    } as unknown as PDFDocumentProxy,
    pages
  };
};

const createLoadingTask = (
  document: PDFDocumentProxy
): PDFDocumentLoadingTask => {
  const destroy = vi.fn(async () => undefined);
  return {
    destroy,
    promise: Promise.resolve(document)
  } as unknown as PDFDocumentLoadingTask;
};

const expectedPages = (count: number): OrganizerSourcePage[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `source-${index + 1}`,
    kind: 'source',
    sourceIndex: index,
    sourcePageNumber: index + 1,
    width: 200,
    height: 300,
    rotation: 0
  }));

const createRendererHarness = async (
  sourceSpecs: FakePageSpec[],
  outputSpecs: FakePageSpec[]
) => {
  const source = createFakeDocument(sourceSpecs);
  const output = createFakeDocument(outputSpecs);
  const sourceLoadingTask = createLoadingTask(source.document);
  const outputLoadingTask = createLoadingTask(output.document);
  const getDocument = vi
    .fn()
    .mockReturnValueOnce(sourceLoadingTask)
    .mockReturnValueOnce(outputLoadingTask);
  vi.mocked(getPdfJs).mockResolvedValue({
    getDocument
  } as unknown as Awaited<ReturnType<typeof getPdfJs>>);

  const renderer = await createPdfThumbnailRenderer(new ArrayBuffer(1));
  return {
    output,
    outputLoadingTask,
    renderer,
    source,
    sourceLoadingTask
  };
};

afterEach(() => {
  vi.restoreAllMocks();
  Reflect.deleteProperty(HTMLCanvasElement.prototype, 'getContext');
  renderedCanvases.length = 0;
});

describe('organizer rendered page verification', () => {
  it('creates stable fingerprints that include pixels and dimensions', async () => {
    const pixels = makePixels(2, 2, 11);

    await expect(createRenderedPageFingerprint(pixels, 2, 2)).resolves.toBe(
      await createRenderedPageFingerprint(pixels.slice(), 2, 2)
    );
    expect(await createRenderedPageFingerprint(pixels, 2, 2)).not.toBe(
      await createRenderedPageFingerprint(makePixels(2, 2, 12), 2, 2)
    );
    expect(await createRenderedPageFingerprint(pixels, 2, 2)).not.toBe(
      await createRenderedPageFingerprint(pixels, 1, 4)
    );
    await expect(createBlankPageFingerprint(2, 2)).resolves.toBe(
      await createRenderedPageFingerprint(
        new Uint8ClampedArray(16).fill(255),
        2,
        2
      )
    );
  });

  it('rejects reordered same-size image-only pages and releases page resources', async () => {
    installCanvasContext();
    const harness = await createRendererHarness(
      [{ marker: 10 }, { marker: 20 }],
      [{ marker: 20 }, { marker: 10 }]
    );

    const result = await harness.renderer.verifyOutput(
      new ArrayBuffer(1),
      expectedPages(2)
    );

    expect(result).toMatchObject({
      geometryMatches: true,
      textMatches: true,
      verified: false,
      visualMatches: false,
      visualPagesChecked: 2
    });
    expect(
      harness.source.pages.every((page) => page.cleanup.mock.calls.length)
    ).toBe(true);
    expect(
      harness.output.pages.every((page) => page.cleanup.mock.calls.length)
    ).toBe(true);
    expect(renderedCanvases).toHaveLength(4);
    expect(
      renderedCanvases.every(
        (canvas) => canvas.width === 1 && canvas.height === 1
      )
    ).toBe(true);
    expect(harness.outputLoadingTask.destroy).toHaveBeenCalledOnce();
    await harness.renderer.destroy();
    expect(harness.sourceLoadingTask.destroy).toHaveBeenCalledOnce();
  });

  it('accepts matching image-only pages in the requested order', async () => {
    installCanvasContext();
    const harness = await createRendererHarness(
      [{ marker: 10 }, { marker: 20 }],
      [{ marker: 10 }, { marker: 20 }]
    );

    const result = await harness.renderer.verifyOutput(
      new ArrayBuffer(1),
      expectedPages(2)
    );

    expect(result).toMatchObject({
      geometryMatches: true,
      textMatches: true,
      verified: true,
      visualMatches: true,
      visualPagesChecked: 2
    });
    await harness.renderer.destroy();
  });

  it('uses visual fingerprints even when extracted text is identical', async () => {
    installCanvasContext();
    const harness = await createRendererHarness(
      [
        { marker: 30, text: 'Same text' },
        { marker: 40, text: 'Same text' }
      ],
      [
        { marker: 40, text: 'Same text' },
        { marker: 30, text: 'Same text' }
      ]
    );

    const result = await harness.renderer.verifyOutput(
      new ArrayBuffer(1),
      expectedPages(2)
    );

    expect(result).toMatchObject({
      textMatches: true,
      textPagesChecked: 2,
      verified: false,
      visualMatches: false,
      visualPagesChecked: 2
    });
    await harness.renderer.destroy();
  });

  it('rejects image content rendered into an expected blank page', async () => {
    installCanvasContext();
    const harness = await createRendererHarness(
      [{ marker: 60 }],
      [{ marker: 60 }, { marker: 60 }]
    );
    const pages: OrganizerPage[] = [
      {
        id: 'blank-1',
        kind: 'blank',
        width: 200,
        height: 300,
        rotation: 0
      },
      expectedPages(1)[0]
    ];

    const result = await harness.renderer.verifyOutput(
      new ArrayBuffer(1),
      pages
    );

    expect(result).toMatchObject({
      blankPagesChecked: 1,
      geometryMatches: true,
      textMatches: true,
      verified: false,
      visualMatches: false,
      visualPagesChecked: 2
    });
    await harness.renderer.destroy();
  });

  it('cancels an active fingerprint render and cleans up the canvas', async () => {
    installCanvasContext();
    const harness = await createRendererHarness(
      [{ marker: 50 }],
      [{ marker: 50, waitForCancel: true }]
    );
    const controller = new AbortController();
    const verification = harness.renderer.verifyOutput(
      new ArrayBuffer(1),
      expectedPages(1),
      controller.signal
    );
    await harness.output.pages[0].renderStarted;

    controller.abort();

    await expect(verification).rejects.toMatchObject({ name: 'AbortError' });
    expect(harness.output.pages[0].renderCancel).toHaveBeenCalledOnce();
    expect(renderedCanvases.at(-1)).toMatchObject({ height: 1, width: 1 });
    expect(harness.outputLoadingTask.destroy).toHaveBeenCalled();
    await harness.renderer.destroy();
  });
});
