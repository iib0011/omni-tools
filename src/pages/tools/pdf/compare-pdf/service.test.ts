import { describe, expect, it } from 'vitest';
import { validateComparisonInputs } from './validation';

function pdfFile(name = 'document.pdf', contents = '%PDF-1.7') {
  return new File([contents], name, { type: 'application/pdf' });
}

describe('validateComparisonInputs', () => {
  it('requires two non-empty PDF files', () => {
    expect(validateComparisonInputs(null, pdfFile(), 8)).toMatch(
      /both Document A and Document B/i
    );
    expect(
      validateComparisonInputs(
        pdfFile(),
        new File([], 'empty.pdf', { type: 'application/pdf' }),
        8
      )
    ).toMatch(/Empty PDF/i);
    expect(
      validateComparisonInputs(
        pdfFile(),
        new File(['text'], 'notes.txt', { type: 'text/plain' }),
        8
      )
    ).toMatch(/must be PDF/i);
  });

  it('accepts PDF files whose browser MIME type is empty', () => {
    const mimeLessPdf = new File(['%PDF-1.7'], 'scan.PDF');

    expect(validateComparisonInputs(pdfFile(), mimeLessPdf, 8)).toBeNull();
  });

  it('requires a whole-number visual tolerance in the supported range', () => {
    expect(validateComparisonInputs(pdfFile(), pdfFile(), -1)).toMatch(
      /between 0 and 64/i
    );
    expect(validateComparisonInputs(pdfFile(), pdfFile(), 6.5)).toMatch(
      /whole number/i
    );
    expect(validateComparisonInputs(pdfFile(), pdfFile(), 65)).toMatch(
      /between 0 and 64/i
    );
    expect(validateComparisonInputs(pdfFile(), pdfFile(), 64)).toBeNull();
  });
});
