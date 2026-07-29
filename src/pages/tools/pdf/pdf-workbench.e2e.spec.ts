import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';
import {
  createImageOnlyOcrPdfFixture,
  createPdfFixture,
  extractPdfText,
  installPdfNetworkAudit,
  preparePdfWorkbenchPage
} from './pdf-workbench.e2e-helpers';

test.describe('PDF workbench routes', () => {
  test.describe.configure({ mode: 'serial' });

  test('OCR configures a local recognition run and downloads verified outputs', async ({
    page
  }) => {
    test.setTimeout(180_000);
    const network = installPdfNetworkAudit(page, 'OCR PDF');
    const fixture = await createImageOnlyOcrPdfFixture();
    expect(await extractPdfText(fixture)).toBe('');
    await preparePdfWorkbenchPage(page);

    await page.goto('/pdf/ocr-pdf');
    await page.locator('#ocr-pdf-input').setInputFiles({
      name: 'ocr-fixture.pdf',
      mimeType: 'application/pdf',
      buffer: fixture
    });
    await expect(page.getByText('PDF has 1 page(s)')).toBeVisible();

    await page.getByRole('textbox', { name: 'Pages', exact: true }).fill('1');
    await page.getByRole('combobox').filter({ hasText: '200 DPI' }).click();
    await page.getByRole('option', { name: '150 DPI' }).click();
    await page
      .getByRole('checkbox', {
        name: 'Automatically detect text orientation'
      })
      .uncheck();
    await page
      .getByRole('checkbox', {
        name: 'Skip pages with meaningful extractable text'
      })
      .uncheck();

    await page.getByRole('button', { name: 'Run OCR' }).click();
    await expect(page.getByRole('status')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'OCR results' })
    ).toBeVisible({ timeout: 120_000 });

    const jsonDownloadPromise = page.waitForEvent('download');
    await page
      .getByRole('listitem')
      .filter({ hasText: 'ocr-fixture-ocr.json' })
      .getByRole('button', { name: 'Download' })
      .click();
    const jsonDownload = await jsonDownloadPromise;
    expect(jsonDownload.suggestedFilename()).toBe('ocr-fixture-ocr.json');
    const jsonPath = await jsonDownload.path();
    expect(jsonPath).not.toBeNull();
    const report = JSON.parse(await readFile(jsonPath!, 'utf8')) as {
      pages: Array<{ status: string; text: string }>;
      source: { pageCount: number };
    };
    expect(report.source.pageCount).toBe(1);
    expect(report.pages[0].status).toBe('ocr');
    expect(report.pages[0].text).toMatch(/OMNI|31415/i);

    const pdfDownloadPromise = page.waitForEvent('download');
    await page
      .getByRole('listitem')
      .filter({ hasText: 'ocr-fixture-searchable.pdf' })
      .getByRole('button', { name: 'Download' })
      .click();
    const pdfDownload = await pdfDownloadPromise;
    const outputPath = await pdfDownload.path();
    expect(outputPath).not.toBeNull();
    const outputBytes = await readFile(outputPath!);
    const output = await PDFDocument.load(outputBytes);
    expect(output.getPageCount()).toBe(1);
    expect(await extractPdfText(outputBytes)).toMatch(/OMNI|31415/i);

    network.assertJavaScriptMime(/\/tesseract\/worker\.min\.js$/);
    network.assertJavaScriptMime(/\/searchable-pdf\.worker-[^/]+\.js$/);
    network.assertNoExternalRequests();

    const wasmResponse = await page.request.get(
      '/pdf-workbench/runtime/tesseract/core/tesseract-core-simd-lstm.wasm'
    );
    expect(wasmResponse.status()).toBe(200);
    expect(wasmResponse.headers()['content-type']).toContain(
      'application/wasm'
    );
  });

  test('OCR rejects malformed input without producing results', async ({
    page
  }) => {
    const network = installPdfNetworkAudit(page, 'OCR malformed PDF');
    await preparePdfWorkbenchPage(page);

    await page.goto('/pdf/ocr-pdf');
    await page.locator('#ocr-pdf-input').setInputFiles({
      name: 'malformed-ocr.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('this is not a PDF')
    });

    await expect(
      page.getByRole('alert').filter({ hasText: 'OCR could not complete' })
    ).toContainText(/valid PDF/i, { timeout: 10_000 });
    await expect(page.getByRole('button', { name: 'Run OCR' })).toBeDisabled();
    await expect(
      page.getByRole('heading', { name: 'OCR results' })
    ).toHaveCount(0);
    network.assertNoExternalRequests();
  });

  test('organizer edits a page model, exports it, and downloads five pages', async ({
    page
  }) => {
    const network = installPdfNetworkAudit(page, 'Organize PDF');
    const fixture = await createPdfFixture([
      'ORGANIZER ALPHA',
      'ORGANIZER BRAVO',
      'ORGANIZER CHARLIE'
    ]);
    await preparePdfWorkbenchPage(page);

    await page.goto('/pdf/organize-pdf');
    await page.getByTestId('organizer-file-input').setInputFiles({
      name: 'organizer-fixture.pdf',
      mimeType: 'application/pdf',
      buffer: fixture
    });
    const openProgress = page.getByTestId('organizer-cancel').waitFor();
    await page.getByTestId('organizer-open').click();
    await openProgress;

    const cards = page.getByTestId('organizer-page');
    await expect(cards).toHaveCount(3);
    await cards.nth(1).click();
    await page.getByRole('button', { name: 'Duplicate selected' }).click();
    await expect(cards).toHaveCount(4);
    await page.getByRole('button', { name: 'Insert blank after' }).click();
    await expect(cards).toHaveCount(5);

    const blankCard = page.getByRole('option', { name: /Blank page/ });
    await blankCard.press('Alt+Home');
    await expect(cards.first()).toContainText('Blank page');
    await page.getByRole('button', { name: 'Undo' }).click();
    await expect(cards.nth(3)).toContainText('Blank page');
    await page.getByRole('button', { name: 'Redo' }).click();
    await expect(cards.first()).toContainText('Blank page');

    const exportProgress = page.getByTestId('organizer-cancel').waitFor();
    await page.getByTestId('organizer-export').click();
    await exportProgress;
    await expect(page.getByTestId('organizer-result')).toContainText(
      'Verified 5 page(s)'
    );

    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('organizer-download').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(
      'organizer-fixture-organized.pdf'
    );
    const outputPath = await download.path();
    expect(outputPath).not.toBeNull();
    const output = await PDFDocument.load(await readFile(outputPath!));
    expect(output.getPageCount()).toBe(5);

    network.assertJavaScriptMime(/\/organize\.worker-[^/]+\.js$/);
    network.assertNoExternalRequests();
  });

  test('organizer rejects malformed input without creating a page model', async ({
    page
  }) => {
    const network = installPdfNetworkAudit(page, 'Organizer malformed PDF');
    await preparePdfWorkbenchPage(page);

    await page.goto('/pdf/organize-pdf');
    await page.getByTestId('organizer-file-input').setInputFiles({
      name: 'malformed-organizer.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('this is not a PDF')
    });
    await page.getByTestId('organizer-open').click();

    await expect(
      page.getByRole('alert').filter({ hasText: 'not a valid PDF' })
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('organizer-page')).toHaveCount(0);
    await expect(page.getByTestId('organizer-result')).toHaveCount(0);
    network.assertNoExternalRequests();
  });

  test('stamp configures a page range and downloads a verified page-numbered PDF', async ({
    page
  }) => {
    const network = installPdfNetworkAudit(page, 'Stamp PDF');
    const fixture = await createPdfFixture(['STAMP ALPHA', 'STAMP BRAVO']);
    await preparePdfWorkbenchPage(page);

    await page.goto('/pdf/stamp-pdf');
    await page.locator('#stamp-pdf-input').setInputFiles({
      name: 'stamp-fixture.pdf',
      mimeType: 'application/pdf',
      buffer: fixture
    });
    await expect(page.getByText('PDF has 2 page(s)')).toBeVisible();

    await page
      .getByRole('combobox')
      .filter({ hasText: 'Text watermark' })
      .click();
    await page.getByRole('option', { name: 'Page numbers' }).click();
    await page.getByRole('checkbox', { name: 'Apply to all pages' }).uncheck();
    await page.getByLabel('Page range').fill('2');
    await page.getByLabel('Page number format').fill('TEST-{current}/{total}');
    await page.getByLabel('Starting page number').fill('7');
    await page.getByRole('button', { name: 'Bottom right' }).click();

    await page.getByRole('button', { name: 'Apply stamp' }).click();
    await expect(page.getByRole('status')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Stamped PDF' })
    ).toBeVisible({ timeout: 30_000 });

    const downloadPromise = page.waitForEvent('download');
    await page
      .getByRole('listitem')
      .filter({ hasText: 'stamp-fixture-stamped.pdf' })
      .getByRole('button', { name: 'Download' })
      .click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('stamp-fixture-stamped.pdf');
    const outputPath = await download.path();
    expect(outputPath).not.toBeNull();
    const output = await PDFDocument.load(await readFile(outputPath!));
    expect(output.getPageCount()).toBe(2);

    network.assertJavaScriptMime(/\/stamp\.worker-[^/]+\.js$/);
    network.assertNoExternalRequests();
  });

  test('stamp rejects malformed input without producing output', async ({
    page
  }) => {
    const network = installPdfNetworkAudit(page, 'Stamp malformed PDF');
    await preparePdfWorkbenchPage(page);

    await page.goto('/pdf/stamp-pdf');
    await page.locator('#stamp-pdf-input').setInputFiles({
      name: 'malformed-stamp.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('this is not a PDF')
    });

    await expect(
      page.getByRole('alert').filter({ hasText: 'Stamping could not complete' })
    ).toContainText(/valid PDF/i, { timeout: 10_000 });
    await expect(
      page.getByRole('button', { name: 'Apply stamp' })
    ).toBeDisabled();
    await expect(
      page.getByRole('heading', { name: 'Stamped PDF' })
    ).toHaveCount(0);
    network.assertNoExternalRequests();
  });

  test('inspector reports metadata and downloads deterministic JSON', async ({
    page
  }) => {
    const network = installPdfNetworkAudit(page, 'Inspect PDF');
    const fixture = await createPdfFixture(
      Array.from({ length: 6 }, (_, index) => `INSPECT PAGE ${index + 1}`),
      { author: 'Fixture Author', title: 'Inspectable fixture' }
    );
    await preparePdfWorkbenchPage(page);

    await page.goto('/pdf/inspect-pdf');
    await page.getByTestId('inspect-pdf-file-input').setInputFiles({
      name: 'inspect-fixture.pdf',
      mimeType: 'application/pdf',
      buffer: fixture
    });

    const progressWasVisible = page
      .getByTestId('inspect-pdf-progress')
      .waitFor();
    await page.getByTestId('inspect-pdf-run').click();
    await progressWasVisible;
    await expect(page.getByTestId('inspect-pdf-report')).toBeVisible({
      timeout: 30_000
    });
    await expect(page.getByTestId('inspect-pdf-report')).toContainText(
      'inspect-fixture.pdf'
    );

    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('inspect-pdf-download').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(
      'inspect-fixture.inspection.json'
    );
    const outputPath = await download.path();
    expect(outputPath).not.toBeNull();
    const report = JSON.parse(await readFile(outputPath!, 'utf8')) as {
      document: { pageCount: number };
      file: { name: string; sha256: string };
      schemaVersion: string;
    };
    expect(report.schemaVersion).toBe('1.0');
    expect(report.file.name).toBe('inspect-fixture.pdf');
    expect(report.file.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(report.document.pageCount).toBe(6);

    network.assertJavaScriptMime(/\/raw-scan\.worker-[^/]+\.js$/);
    network.assertNoExternalRequests();
  });

  test('inspector rejects malformed input without producing a report', async ({
    page
  }) => {
    const network = installPdfNetworkAudit(page, 'Inspect malformed PDF');
    await preparePdfWorkbenchPage(page);

    await page.goto('/pdf/inspect-pdf');
    await page.getByTestId('inspect-pdf-file-input').setInputFiles({
      name: 'malformed.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('this is not a PDF')
    });
    await page.getByTestId('inspect-pdf-run').click();

    await expect(page.getByTestId('inspect-pdf-error')).toContainText(
      /recognizable PDF header|valid PDF/i,
      { timeout: 10_000 }
    );
    await expect(page.getByTestId('inspect-pdf-report')).toHaveCount(0);
    network.assertNoExternalRequests();
  });
});
