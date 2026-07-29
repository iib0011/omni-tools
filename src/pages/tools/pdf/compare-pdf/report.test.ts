import { describe, expect, it, vi } from 'vitest';
import {
  assembleComparisonReport,
  compareMetadata,
  finalizePageComparison
} from './report';
import {
  ComparedDocument,
  PageComparison,
  PagePresence,
  TextComparisonStatus
} from './types';
import {
  createExportedComparisonReport,
  disposeComparisonResult,
  serializeComparisonReport
} from './export';

function document(
  fileName: string,
  pageCount: number,
  metadata: Record<string, string> = {}
): ComparedDocument {
  return {
    fileName,
    byteSize: 1024,
    pageCount,
    metadata
  };
}

function page({
  pageNumber,
  visual = 0,
  text = 0,
  textStatus = text ? 'changed' : 'identical',
  presence = 'both',
  dimensionsDiffer = false,
  rotationDiffers = false
}: {
  pageNumber: number;
  visual?: number;
  text?: number | null;
  textStatus?: TextComparisonStatus;
  presence?: PagePresence;
  dimensionsDiffer?: boolean;
  rotationDiffers?: boolean;
}): PageComparison {
  const totalPixels = 10000;
  const changedPixels =
    presence === 'both'
      ? Math.round((visual / 100) * totalPixels)
      : totalPixels;
  const geometry = {
    widthPoints: 612,
    heightPoints: 792,
    rotation: 0
  };

  return finalizePageComparison({
    pageNumber,
    presence,
    documentA: presence === 'missing-from-a' ? null : geometry,
    documentB: presence === 'missing-from-b' ? null : geometry,
    dimensionsDiffer,
    rotationDiffers,
    visual: {
      changedPixels,
      totalPixels,
      changedPercentage: presence === 'both' ? visual : 100,
      tolerance: 8
    },
    text: {
      status: textStatus,
      characterCountA: 20,
      characterCountB: 20,
      changedPercentage: text,
      segments: []
    }
  });
}

describe('comparison report', () => {
  it('produces a clear zero-difference result for identical pages', () => {
    const report = assembleComparisonReport({
      generatedAt: '2026-01-01T00:00:00.000Z',
      tolerance: 8,
      documentA: document('a.pdf', 2, { Title: 'Same' }),
      documentB: document('b.pdf', 2, { Title: 'Same' }),
      pages: [page({ pageNumber: 1 }), page({ pageNumber: 2 })]
    });

    expect(report.summary).toMatchObject({
      identicalPages: 2,
      changedPages: 0,
      metadataDifferenceCount: 0,
      highestChangedPixelPercentage: 0,
      documentsIdentical: true,
      rankedPageNumbers: [1, 2]
    });
  });

  it('detects and ranks the page with the greatest difference first', () => {
    const report = assembleComparisonReport({
      tolerance: 8,
      documentA: document('a.pdf', 3),
      documentB: document('b.pdf', 3),
      pages: [
        page({ pageNumber: 1, visual: 2 }),
        page({ pageNumber: 2, visual: 35 }),
        page({ pageNumber: 3, visual: 5, text: 70 })
      ]
    });

    expect(report.summary.changedPages).toBe(3);
    expect(report.summary.rankedPageNumbers).toEqual([3, 2, 1]);
    expect(report.pages[2].differenceScore).toBe(70);
  });

  it('represents different page counts as explicit missing pages', () => {
    const report = assembleComparisonReport({
      tolerance: 8,
      documentA: document('a.pdf', 1),
      documentB: document('b.pdf', 3),
      pages: [
        page({ pageNumber: 1 }),
        page({
          pageNumber: 2,
          presence: 'missing-from-a',
          text: 100,
          textStatus: 'only-b-has-text'
        }),
        page({
          pageNumber: 3,
          presence: 'missing-from-a',
          text: null,
          textStatus: 'no-text-layer'
        })
      ]
    });

    expect(report.summary).toMatchObject({
      comparedPages: 3,
      changedPages: 2,
      pagesMissingFromA: 2,
      pagesMissingFromB: 0,
      rankedPageNumbers: [2, 3, 1],
      documentsIdentical: false
    });
    expect(report.pages[1]).toMatchObject({
      presence: 'missing-from-a',
      differenceScore: 100,
      visual: { changedPercentage: 100 }
    });
  });

  it('compares metadata fields without hiding absent values', () => {
    expect(
      compareMetadata(
        { Author: 'A', Title: 'Shared' },
        { Author: 'B', Subject: 'Added', Title: 'Shared' }
      )
    ).toEqual([
      { field: 'Author', documentA: 'A', documentB: 'B' },
      { field: 'Subject', documentA: null, documentB: 'Added' }
    ]);
  });

  it('exports reviewed state without runtime visual URLs', () => {
    const report = assembleComparisonReport({
      generatedAt: '2026-01-01T00:00:00.000Z',
      tolerance: 8,
      documentA: document('a.pdf', 2),
      documentB: document('b.pdf', 2),
      pages: [page({ pageNumber: 1 }), page({ pageNumber: 2, visual: 4 })]
    });
    const exported = createExportedComparisonReport(report, new Set([2]));
    const serialized = serializeComparisonReport(report, new Set([2]));

    expect(exported.reviewedPageNumbers).toEqual([2]);
    expect(exported.pages.map(({ reviewed }) => reviewed)).toEqual([
      false,
      true
    ]);
    expect(serialized).toContain('"reviewed": true');
    expect(serialized).not.toContain('blob:');
  });

  it('revokes every preview URL and clears retained visual assets', () => {
    const revokeObjectUrl = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => undefined);
    const objectUrls = ['blob:first', 'blob:second', 'blob:mask'];
    const visualAssets = new Map([
      [
        1,
        {
          pageNumber: 1,
          documentAUrl: objectUrls[0],
          documentBUrl: objectUrls[1],
          differenceMaskUrl: objectUrls[2],
          normalizedWidth: 100,
          normalizedHeight: 100
        }
      ]
    ]);
    const report = assembleComparisonReport({
      tolerance: 8,
      documentA: document('a.pdf', 1),
      documentB: document('b.pdf', 1),
      pages: [page({ pageNumber: 1 })]
    });

    disposeComparisonResult({ report, visualAssets, objectUrls });

    expect(revokeObjectUrl.mock.calls.map(([url]) => url)).toEqual([
      'blob:first',
      'blob:second',
      'blob:mask'
    ]);
    expect(objectUrls).toEqual([]);
    expect(visualAssets.size).toBe(0);
    revokeObjectUrl.mockRestore();
  });
});
