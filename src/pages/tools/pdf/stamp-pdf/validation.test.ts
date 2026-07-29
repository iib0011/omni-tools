import { describe, expect, it } from 'vitest';
import type { StampOptions } from './types';
import { getStampValidationError } from './validation';

const options: StampOptions = {
  mode: 'text',
  pageRange: '',
  layer: 'above',
  position: 'middle-center',
  horizontalMargin: 24,
  verticalMargin: 24,
  opacity: 0.35,
  rotation: -30,
  fontSize: 36,
  color: '#d32f2f',
  text: 'DRAFT',
  pageNumberFormat: 'Page {current} of {total}',
  startingPageNumber: 1,
  batesPrefix: '',
  batesSuffix: '',
  batesStart: 1,
  batesPadding: 6,
  headerText: '',
  footerText: '',
  imageScale: 25,
  preserveAspectRatio: true
};

describe('stamp input validation', () => {
  it('accepts valid text and image configurations', () => {
    expect(getStampValidationError(options, { present: false })).toBeNull();
    expect(
      getStampValidationError(
        { ...options, mode: 'image' },
        { present: true, mimeType: 'image/png' }
      )
    ).toBeNull();
  });

  it('rejects missing or unsupported watermark images', () => {
    expect(
      getStampValidationError({ ...options, mode: 'image' }, { present: false })
    ).toBe('missing-value');
    expect(
      getStampValidationError(
        { ...options, mode: 'image' },
        { present: true, mimeType: 'image/svg+xml' }
      )
    ).toBe('invalid-image');
  });

  it.each([
    [{ fontSize: 0 }, 'invalid-number'],
    [{ opacity: Number.NaN }, 'invalid-number'],
    [{ opacity: 1.1 }, 'invalid-number'],
    [{ horizontalMargin: -1 }, 'invalid-number'],
    [{ color: 'red' }, 'invalid-color']
  ] as const)('rejects unsafe option values %o', (patch, expected) => {
    expect(
      getStampValidationError({ ...options, ...patch }, { present: false })
    ).toBe(expected);
  });

  it('validates page and Bates numbering controls', () => {
    expect(
      getStampValidationError(
        {
          ...options,
          mode: 'page-numbers',
          pageNumberFormat: 'fixed text'
        },
        { present: false }
      )
    ).toBe('invalid-template');
    expect(
      getStampValidationError(
        { ...options, mode: 'bates', batesPadding: 0 },
        { present: false }
      )
    ).toBe('invalid-number');
  });
});
