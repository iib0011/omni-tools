function isPdfFile(file: File): boolean {
  return (
    file.type === 'application/pdf' ||
    (file.type === '' && file.name.toLowerCase().endsWith('.pdf'))
  );
}

export type ComparisonValidationCode =
  | 'missing-inputs'
  | 'invalid-file-type'
  | 'empty-file'
  | 'invalid-tolerance';

export interface ComparisonValidationError {
  code: ComparisonValidationCode;
  message: string;
}

export function getComparisonValidationError(
  fileA: File | null,
  fileB: File | null,
  tolerance: number
): ComparisonValidationError | null {
  if (!fileA || !fileB) {
    return {
      code: 'missing-inputs',
      message:
        'Choose both Document A and Document B before running the comparison.'
    };
  }
  if (!isPdfFile(fileA) || !isPdfFile(fileB)) {
    return {
      code: 'invalid-file-type',
      message: 'Both inputs must be PDF files.'
    };
  }
  if (fileA.size === 0 || fileB.size === 0) {
    return {
      code: 'empty-file',
      message: 'Empty PDF files cannot be compared.'
    };
  }
  if (!Number.isInteger(tolerance) || tolerance < 0 || tolerance > 64) {
    return {
      code: 'invalid-tolerance',
      message: 'Visual tolerance must be a whole number between 0 and 64.'
    };
  }
  return null;
}

export function validateComparisonInputs(
  fileA: File | null,
  fileB: File | null,
  tolerance: number
): string | null {
  return getComparisonValidationError(fileA, fileB, tolerance)?.message ?? null;
}
