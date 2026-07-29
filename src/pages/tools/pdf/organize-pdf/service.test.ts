import {
  degrees,
  PDFDocument,
  PDFHexString,
  PDFName,
  StandardFonts
} from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import {
  createOrganizedFileName,
  exportOrganizedPdf,
  inspectOrganizerPdf
} from './service';
import { OrganizerPage, OrganizerProgress } from './types';
import {
  commitOrganizerAction,
  createOrganizerHistory,
  setOrganizerSelection
} from './model';

const createFixture = async (): Promise<ArrayBuffer> => {
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);
  const specs = [
    { width: 200, height: 300, rotation: 0 },
    { width: 320, height: 420, rotation: 90 },
    { width: 440, height: 540, rotation: 180 }
  ];

  specs.forEach((spec, index) => {
    const page = document.addPage([spec.width, spec.height]);
    page.setRotation(degrees(spec.rotation));
    page.drawText(`Fixture page ${index + 1}`, {
      x: 20,
      y: 40,
      size: 12,
      font
    });
  });

  const bytes = await document.save();
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
};

const createSignatureFieldFixture = async (): Promise<ArrayBuffer> => {
  const document = await PDFDocument.create();
  const page = document.addPage([200, 300]);
  const signatureWidget = document.context.obj({
    Type: 'Annot',
    Subtype: 'Widget',
    FT: 'Sig',
    T: PDFHexString.fromText('ApprovalSignature'),
    Rect: [0, 0, 0, 0],
    P: page.ref
  });
  const signatureRef = document.context.register(signatureWidget);
  page.node.addAnnot(signatureRef);
  document.catalog.set(
    PDFName.of('AcroForm'),
    document.context.obj({
      Fields: [signatureRef],
      SigFlags: 3
    })
  );
  const bytes = await document.save();
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
};

describe('organize-pdf service', () => {
  it('inspects source dimensions, rotations, and page count', async () => {
    const progress: OrganizerProgress[] = [];
    const inspection = await inspectOrganizerPdf(
      await createFixture(),
      (update) => progress.push(update)
    );

    expect(inspection.pageCount).toBe(3);
    expect(inspection.hasSignatureFields).toBe(false);
    expect(inspection.pages).toMatchObject([
      { sourcePageNumber: 1, width: 200, height: 300, rotation: 0 },
      { sourcePageNumber: 2, width: 320, height: 420, rotation: 90 },
      { sourcePageNumber: 3, width: 440, height: 540, rotation: 180 }
    ]);
    expect(progress.at(-1)).toEqual({
      stage: 'inspecting',
      current: 3,
      total: 3
    });
  });

  it('detects digital signature fields before organization', async () => {
    const inspection = await inspectOrganizerPdf(
      await createSignatureFieldFixture()
    );

    expect(inspection.hasSignatureFields).toBe(true);
  });

  it('reorders, deletes, duplicates, and verifies the output sequence', async () => {
    const source = await createFixture();
    const inspection = await inspectOrganizerPdf(source.slice(0));
    let history = createOrganizerHistory(inspection.pages);
    history = setOrganizerSelection(history, ['source-3']);
    history = commitOrganizerAction(history, {
      type: 'reorder-selected',
      pageIds: history.present.selectedIds,
      targetId: 'source-1',
      placement: 'before'
    });
    history = setOrganizerSelection(history, ['source-2']);
    history = commitOrganizerAction(history, { type: 'delete-selected' });
    history = setOrganizerSelection(history, ['source-1']);
    history = commitOrganizerAction(history, {
      type: 'duplicate-selected',
      newIds: ['copy-page-1']
    });

    const result = await exportOrganizedPdf(source, history.present.pages);
    const reopened = await PDFDocument.load(result.bytes);
    const outputGeometry = reopened.getPages().map((page) => ({
      ...page.getSize(),
      rotation: page.getRotation().angle
    }));

    expect(reopened.getPageCount()).toBe(3);
    expect(outputGeometry).toEqual([
      { width: 440, height: 540, rotation: 180 },
      { width: 200, height: 300, rotation: 0 },
      { width: 200, height: 300, rotation: 0 }
    ]);
    expect(result.verification).toEqual({
      pageCount: 3,
      expectedPageCount: 3,
      geometryVerified: true,
      sequence: ['source:3', 'source:1', 'source:1']
    });
  });

  it('inserts a blank page with requested dimensions and rotation', async () => {
    const source = await createFixture();
    const inspection = await inspectOrganizerPdf(source.slice(0));
    const pages: OrganizerPage[] = [
      inspection.pages[0],
      {
        id: 'blank-landscape',
        kind: 'blank',
        width: 320,
        height: 420,
        rotation: 90
      },
      inspection.pages[2]
    ];

    const result = await exportOrganizedPdf(source, pages);
    const reopened = await PDFDocument.load(result.bytes);
    const blankPage = reopened.getPage(1);

    expect(reopened.getPageCount()).toBe(3);
    expect(blankPage.getSize()).toEqual({ width: 320, height: 420 });
    expect(blankPage.getRotation().angle).toBe(90);
  });

  it('reports page-level export progress', async () => {
    const source = await createFixture();
    const inspection = await inspectOrganizerPdf(source.slice(0));
    const progress: OrganizerProgress[] = [];

    await exportOrganizedPdf(source, inspection.pages, (update) =>
      progress.push(update)
    );

    expect(progress).toContainEqual({
      stage: 'copying',
      current: 3,
      total: 3
    });
    expect(progress).toContainEqual({
      stage: 'verifying',
      current: 3,
      total: 3
    });
  });

  it('rejects malformed input with a structured error', async () => {
    await expect(
      inspectOrganizerPdf(new TextEncoder().encode('not a pdf'))
    ).rejects.toMatchObject({
      code: 'INVALID_PDF'
    });
  });

  it('stops before processing when cancelled', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      inspectOrganizerPdf(await createFixture(), undefined, controller.signal)
    ).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('creates a safe organized output name', () => {
    expect(createOrganizedFileName('Quarterly.Report.PDF')).toBe(
      'Quarterly.Report-organized.pdf'
    );
    expect(createOrganizedFileName('.pdf')).toBe('document-organized.pdf');
  });
});
