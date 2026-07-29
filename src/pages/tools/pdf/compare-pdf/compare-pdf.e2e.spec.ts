import { expect, Page, test } from '@playwright/test';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const appOrigin = 'http://localhost:4173';
const fixtureTimestamp = new Date('2026-01-01T00:00:00.000Z');

interface DownloadedComparisonReport {
  documentA: { pageCount: number };
  documentB: { pageCount: number };
  summary: {
    comparedPages: number;
    identicalPages: number;
    changedPages: number;
    pagesMissingFromA: number;
    pagesMissingFromB: number;
    highestChangedPixelPercentage: number;
    documentsIdentical: boolean;
  };
  pages: Array<{
    pageNumber: number;
    presence: 'both' | 'missing-from-a' | 'missing-from-b';
    differenceScore: number;
    visual: {
      changedPixels: number;
      totalPixels: number;
      changedPercentage: number;
    };
    text: {
      status: string;
      changedPercentage: number | null;
    };
  }>;
}

async function createPdf(
  pageTexts: string[],
  {
    title = 'Comparison fixture',
    pageSize = [612, 792] as [number, number]
  }: {
    title?: string;
    pageSize?: [number, number];
  } = {}
): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  pdf.setTitle(title);
  pdf.setAuthor('OmniTools tests');
  pdf.setCreator('OmniTools Playwright fixtures');
  pdf.setProducer('OmniTools Playwright fixtures');
  pdf.setCreationDate(fixtureTimestamp);
  pdf.setModificationDate(fixtureTimestamp);

  pageTexts.forEach((text, index) => {
    const page = pdf.addPage(pageSize);
    page.drawText(`Page ${index + 1}`, {
      x: 48,
      y: pageSize[1] - 64,
      size: 18,
      font,
      color: rgb(0.1, 0.1, 0.1)
    });
    page.drawText(text, {
      x: 48,
      y: pageSize[1] - 112,
      size: 14,
      font,
      color: rgb(0.1, 0.2, 0.5),
      maxWidth: pageSize[0] - 96
    });
  });

  return Buffer.from(await pdf.save({ useObjectStreams: false }));
}

function installExternalNetworkGuard(page: Page): {
  assertNoExternalRequests: () => void;
} {
  const externalRequests: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      url.origin !== appOrigin
    ) {
      externalRequests.push(request.url());
    }
  });
  return {
    assertNoExternalRequests: () => {
      expect(externalRequests, 'external requests from Compare PDFs').toEqual(
        []
      );
    }
  };
}

async function uploadTwoPdfs(
  page: Page,
  documentA: Buffer,
  documentB: Buffer
): Promise<void> {
  await page.getByTestId('compare-pdf-input-a').setInputFiles({
    name: 'document-a.pdf',
    mimeType: 'application/pdf',
    buffer: documentA
  });
  await page.getByTestId('compare-pdf-input-b').setInputFiles({
    name: 'document-b.pdf',
    mimeType: 'application/pdf',
    buffer: documentB
  });
}

async function downloadComparisonJson(
  page: Page
): Promise<DownloadedComparisonReport> {
  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('compare-pdf-download-json').click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  expect(downloadPath).not.toBeNull();
  const contents = await (
    await import('node:fs/promises')
  ).readFile(downloadPath!, 'utf8');
  return JSON.parse(contents) as DownloadedComparisonReport;
}

test.describe('Compare PDFs', () => {
  test('runs the full pipeline for identical PDFs without reporting visual or text changes', async ({
    page
  }) => {
    const networkGuard = installExternalNetworkGuard(page);
    const identicalPdf = await createPdf([
      'The first page is identical.',
      'The second page is also identical.'
    ]);

    await page.goto('/pdf/compare-pdf');
    await uploadTwoPdfs(page, identicalPdf, identicalPdf);
    await page.getByTestId('compare-pdf-run').click();

    await expect(page.getByTestId('compare-pdf-result')).toBeVisible({
      timeout: 30000
    });
    await expect(
      page.getByText(
        /No visual, text, page-structure, or metadata differences were detected/i
      )
    ).toBeVisible();

    const report = await downloadComparisonJson(page);
    expect(report.summary).toMatchObject({
      comparedPages: 2,
      identicalPages: 2,
      changedPages: 0,
      pagesMissingFromA: 0,
      pagesMissingFromB: 0,
      highestChangedPixelPercentage: 0,
      documentsIdentical: true
    });
    expect(report.pages).toHaveLength(2);
    report.pages.forEach((comparedPage) => {
      expect(comparedPage).toMatchObject({
        presence: 'both',
        differenceScore: 0,
        visual: {
          changedPixels: 0,
          changedPercentage: 0
        },
        text: {
          status: 'identical',
          changedPercentage: 0
        }
      });
      expect(comparedPage.visual.totalPixels).toBeGreaterThan(0);
    });
    networkGuard.assertNoExternalRequests();
  });

  test('represents extra pages from the full pipeline as missing page positions', async ({
    page
  }) => {
    const networkGuard = installExternalNetworkGuard(page);
    const documentA = await createPdf(['Shared first page.']);
    const documentB = await createPdf([
      'Shared first page.',
      'Only Document B has this second page.',
      'Only Document B has this third page.'
    ]);

    await page.goto('/pdf/compare-pdf');
    await uploadTwoPdfs(page, documentA, documentB);
    await page.getByTestId('compare-pdf-run').click();

    await expect(page.getByTestId('compare-pdf-result')).toBeVisible({
      timeout: 30000
    });
    await expect(page.getByText(/Pages: 1 vs 3/i)).toBeVisible();
    await expect(
      page.getByText(/2 of 3 paired page positions contain a difference/i)
    ).toBeVisible();

    const report = await downloadComparisonJson(page);
    expect(report.documentA.pageCount).toBe(1);
    expect(report.documentB.pageCount).toBe(3);
    expect(report.summary).toMatchObject({
      comparedPages: 3,
      identicalPages: 1,
      changedPages: 2,
      pagesMissingFromA: 2,
      pagesMissingFromB: 0,
      highestChangedPixelPercentage: 100,
      documentsIdentical: false
    });
    expect(report.pages[0]).toMatchObject({
      pageNumber: 1,
      presence: 'both',
      differenceScore: 0,
      visual: { changedPixels: 0, changedPercentage: 0 },
      text: { status: 'identical', changedPercentage: 0 }
    });
    report.pages.slice(1).forEach((comparedPage, index) => {
      expect(comparedPage).toMatchObject({
        pageNumber: index + 2,
        presence: 'missing-from-a',
        differenceScore: 100,
        visual: { changedPercentage: 100 },
        text: { status: 'only-b-has-text', changedPercentage: 100 }
      });
      expect(comparedPage.visual.changedPixels).toBe(
        comparedPage.visual.totalPixels
      );
    });
    networkGuard.assertNoExternalRequests();
  });

  test('uploads, configures, compares, reviews, changes views, and downloads JSON', async ({
    page
  }) => {
    const networkGuard = installExternalNetworkGuard(page);
    const documentA = await createPdf([
      'This page is unchanged.',
      'The original approval amount is 100 dollars.',
      'This final page is unchanged.'
    ]);
    const documentB = await createPdf([
      'This page is unchanged.',
      'The revised approval amount is 250 dollars.',
      'This final page is unchanged.'
    ]);

    await page.goto('/pdf/compare-pdf');
    await uploadTwoPdfs(page, documentA, documentB);
    const tolerance = page.getByRole('slider', {
      name: 'Visual tolerance'
    });
    await tolerance.fill('12');
    await expect(tolerance).toHaveValue('12');

    await page.getByTestId('compare-pdf-run').click();
    await expect(page.getByTestId('compare-pdf-progress')).toBeVisible();
    await expect(page.getByTestId('compare-pdf-result')).toBeVisible({
      timeout: 30000
    });
    await expect(
      page.getByText(/1 of 3 paired page positions contain a difference/i)
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Page 2/i }).first()
    ).toBeVisible();

    await page.getByRole('tab', { name: 'Overlay' }).click();
    await expect(
      page.getByRole('slider', { name: /Document B opacity/i })
    ).toBeVisible();
    await page.getByRole('tab', { name: 'Swipe / reveal' }).click();
    await expect(
      page.getByRole('slider', { name: /Reveal position/i })
    ).toBeVisible();
    await page.getByRole('tab', { name: 'Difference mask' }).click();
    await expect(page.getByAltText(/Difference mask, page 2/i)).toBeVisible();
    await page.getByRole('tab', { name: 'Extracted text diff' }).click();
    const textDiff = page.getByLabel('Extracted text differences');
    await expect(textDiff.locator('del')).toContainText([/original/i, '100']);
    await expect(textDiff.locator('ins')).toContainText([/revised/i, '250']);

    await page.getByRole('checkbox', { name: 'Review page 2' }).check();
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('compare-pdf-download-json').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(
      /^compare-document-a-vs-document-b\.json$/
    );
    const downloadPath = await download.path();
    expect(downloadPath).not.toBeNull();
    const contents = await (
      await import('node:fs/promises')
    ).readFile(downloadPath!, 'utf8');
    const report = JSON.parse(contents) as {
      reviewedPageNumbers: number[];
      pages: Array<{ pageNumber: number; reviewed: boolean }>;
    };
    expect(report.reviewedPageNumbers).toEqual([2]);
    expect(
      report.pages.find(({ pageNumber }) => pageNumber === 2)?.reviewed
    ).toBe(true);
    networkGuard.assertNoExternalRequests();
  });

  test('cancels an in-progress visual comparison without retaining a partial report', async ({
    page
  }) => {
    const networkGuard = installExternalNetworkGuard(page);
    const pageTextsA = Array.from(
      { length: 18 },
      (_, index) => `Large comparison page ${index + 1}, revision A.`
    );
    const pageTextsB = pageTextsA.map((text, index) =>
      index % 2 ? `${text} Changed.` : text
    );
    const documentA = await createPdf(pageTextsA, {
      pageSize: [1200, 1200]
    });
    const documentB = await createPdf(pageTextsB, {
      pageSize: [1200, 1200]
    });

    await page.goto('/pdf/compare-pdf');
    await uploadTwoPdfs(page, documentA, documentB);
    await page.getByTestId('compare-pdf-run').click();
    await expect(page.getByTestId('compare-pdf-progress')).toBeVisible();
    await page.getByTestId('compare-pdf-cancel').click();

    await expect(page.getByTestId('compare-pdf-cancelled')).toBeVisible({
      timeout: 10000
    });
    await expect(page.getByTestId('compare-pdf-result')).toHaveCount(0);
    networkGuard.assertNoExternalRequests();
  });

  test('shows a useful error for malformed input', async ({ page }) => {
    const networkGuard = installExternalNetworkGuard(page);
    const validPdf = await createPdf(['Valid comparison document.']);

    await page.goto('/pdf/compare-pdf');
    await uploadTwoPdfs(page, Buffer.from('this is not a PDF'), validPdf);
    await page.getByTestId('compare-pdf-run').click();

    await expect(page.getByTestId('compare-pdf-error')).toContainText(
      /malformed|valid PDF|could not be opened/i,
      { timeout: 10000 }
    );
    await expect(page.getByTestId('compare-pdf-result')).toHaveCount(0);
    networkGuard.assertNoExternalRequests();
  });
});
