import { describe, expect, it } from 'vitest';
import { tools } from '../../../tools';

const phaseOneRoutes = [
  'pdf/ocr-pdf',
  'pdf/organize-pdf',
  'pdf/stamp-pdf',
  'pdf/compare-pdf',
  'pdf/inspect-pdf'
];

describe('PDF tool registry', () => {
  it('registers exactly the five Phase 1 routes without duplicates', () => {
    const pdfTools = tools.filter((tool) => tool.type === 'pdf');
    const paths = pdfTools.map((tool) => tool.path);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths.filter((path) => phaseOneRoutes.includes(path))).toEqual(
      phaseOneRoutes
    );
    expect(
      paths.filter(
        (path) =>
          path.startsWith('pdf/') &&
          ['ocr', 'organize', 'stamp', 'compare', 'inspect'].some((name) =>
            path.includes(name)
          )
      )
    ).toEqual(phaseOneRoutes);
    expect(
      pdfTools
        .filter((tool) => phaseOneRoutes.includes(tool.path))
        .every((tool) => typeof tool.icon !== 'string')
    ).toBe(true);
  });
});
