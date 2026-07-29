import {
  COMPARISON_REPORT_VERSION,
  ComparedDocument,
  ComparisonReport,
  ComparisonSummary,
  MetadataDifference,
  PageComparison
} from './types';

function roundPercentage(value: number): number {
  return Math.round(value * 10000) / 10000;
}

export function compareMetadata(
  metadataA: Record<string, string>,
  metadataB: Record<string, string>
): MetadataDifference[] {
  const fields = Array.from(
    new Set([...Object.keys(metadataA), ...Object.keys(metadataB)])
  ).sort((left, right) => left.localeCompare(right));

  return fields.flatMap((field) => {
    const documentA = metadataA[field] ?? null;
    const documentB = metadataB[field] ?? null;
    if (documentA === documentB) {
      return [];
    }
    return [{ field, documentA, documentB }];
  });
}

export function calculatePageDifferenceScore(
  page: Omit<PageComparison, 'differenceScore'>
): number {
  if (page.presence !== 'both') {
    return 100;
  }

  const textScore = page.text.changedPercentage ?? 0;
  const structuralScore =
    (page.dimensionsDiffer ? 10 : 0) + (page.rotationDiffers ? 5 : 0);

  return roundPercentage(
    Math.min(
      100,
      Math.max(page.visual.changedPercentage, textScore) + structuralScore
    )
  );
}

export function finalizePageComparison(
  page: Omit<PageComparison, 'differenceScore'>
): PageComparison {
  return {
    ...page,
    visual: {
      ...page.visual,
      changedPercentage: roundPercentage(page.visual.changedPercentage)
    },
    text: {
      ...page.text,
      changedPercentage:
        page.text.changedPercentage === null
          ? null
          : roundPercentage(page.text.changedPercentage)
    },
    differenceScore: calculatePageDifferenceScore(page)
  };
}

export function pageHasMeaningfulDifference(page: PageComparison): boolean {
  return (
    page.presence !== 'both' ||
    page.dimensionsDiffer ||
    page.rotationDiffers ||
    page.visual.changedPixels > 0 ||
    page.text.status === 'changed' ||
    page.text.status === 'only-a-has-text' ||
    page.text.status === 'only-b-has-text' ||
    page.text.status === 'comparison-limited'
  );
}

export function createComparisonSummary(
  pages: PageComparison[],
  metadataDifferences: MetadataDifference[]
): ComparisonSummary {
  const rankedPages = [...pages].sort(
    (left, right) =>
      right.differenceScore - left.differenceScore ||
      right.visual.changedPercentage - left.visual.changedPercentage ||
      left.pageNumber - right.pageNumber
  );
  const changedPages = pages.filter(pageHasMeaningfulDifference).length;
  const pagesMissingFromA = pages.filter(
    ({ presence }) => presence === 'missing-from-a'
  ).length;
  const pagesMissingFromB = pages.filter(
    ({ presence }) => presence === 'missing-from-b'
  ).length;

  return {
    comparedPages: pages.length,
    identicalPages: pages.length - changedPages,
    changedPages,
    pagesMissingFromA,
    pagesMissingFromB,
    metadataDifferenceCount: metadataDifferences.length,
    highestChangedPixelPercentage: roundPercentage(
      pages.reduce(
        (highest, page) => Math.max(highest, page.visual.changedPercentage),
        0
      )
    ),
    rankedPageNumbers: rankedPages.map(({ pageNumber }) => pageNumber),
    documentsIdentical: changedPages === 0 && metadataDifferences.length === 0
  };
}

export function assembleComparisonReport({
  generatedAt = new Date().toISOString(),
  tolerance,
  documentA,
  documentB,
  pages
}: {
  generatedAt?: string;
  tolerance: number;
  documentA: ComparedDocument;
  documentB: ComparedDocument;
  pages: PageComparison[];
}): ComparisonReport {
  const metadataDifferences = compareMetadata(
    documentA.metadata,
    documentB.metadata
  );

  return {
    reportVersion: COMPARISON_REPORT_VERSION,
    generatedAt,
    tolerance,
    documentA,
    documentB,
    metadataDifferences,
    summary: createComparisonSummary(pages, metadataDifferences),
    pages
  };
}
