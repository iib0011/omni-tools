import {
  ComparisonReport,
  ComparisonResult,
  ExportedComparisonReport
} from './types';
import { saveBlob } from '../../../../lib/pdf-workbench/save-file';

const LARGE_REPORT_BYTES = 5 * 1024 * 1024;

function baseName(fileName: string): string {
  const withoutExtension = fileName.replace(/\.pdf$/i, '');
  const safeName = withoutExtension
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}._-]+/gu, '-')
    .replace(/^-+|-+$/g, '');
  return safeName || 'document';
}

export function createExportedComparisonReport(
  report: ComparisonReport,
  reviewedPageNumbers: ReadonlySet<number>
): ExportedComparisonReport {
  const reviewed = Array.from(reviewedPageNumbers).sort(
    (left, right) => left - right
  );
  return {
    ...report,
    reviewedPageNumbers: reviewed,
    pages: report.pages.map((page) => ({
      ...page,
      reviewed: reviewedPageNumbers.has(page.pageNumber)
    }))
  };
}

export function serializeComparisonReport(
  report: ComparisonReport,
  reviewedPageNumbers: ReadonlySet<number>
): string {
  return JSON.stringify(
    createExportedComparisonReport(report, reviewedPageNumbers),
    null,
    2
  );
}

export function downloadComparisonReport(
  report: ComparisonReport,
  reviewedPageNumbers: ReadonlySet<number>,
  description = 'PDF comparison report'
): Promise<void> {
  const contents = serializeComparisonReport(report, reviewedPageNumbers);
  const blob = new Blob([contents], {
    type: 'application/json;charset=utf-8'
  });
  return saveBlob(blob, {
    suggestedName: `compare-${baseName(
      report.documentA.fileName
    )}-vs-${baseName(report.documentB.fileName)}.json`,
    mimeType: 'application/json',
    extensions: ['.json'],
    description,
    preferFilePicker: blob.size >= LARGE_REPORT_BYTES
  }).then(() => undefined);
}

export function disposeComparisonResult(result: ComparisonResult | null): void {
  if (!result) {
    return;
  }
  result.objectUrls.forEach((objectUrl) => {
    URL.revokeObjectURL(objectUrl);
  });
  result.objectUrls.length = 0;
  result.visualAssets.clear();
}
