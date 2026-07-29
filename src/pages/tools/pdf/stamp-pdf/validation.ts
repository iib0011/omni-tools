import type { StampOptions } from './types';

export type StampValidationError =
  | 'missing-value'
  | 'invalid-image'
  | 'invalid-color'
  | 'invalid-number'
  | 'invalid-template';

const finite = (value: number): boolean => Number.isFinite(value);
const integer = (value: number): boolean =>
  finite(value) && Number.isInteger(value);

export function getStampValidationError(
  options: StampOptions,
  image: { present: boolean; mimeType?: string }
): StampValidationError | null {
  if (options.mode === 'image') {
    if (!image.present) return 'missing-value';
    if (!['image/png', 'image/jpeg'].includes(image.mimeType ?? '')) {
      return 'invalid-image';
    }
  }
  if (options.mode === 'text' && !options.text.trim()) {
    return 'missing-value';
  }
  if (
    options.mode === 'header-footer' &&
    !options.headerText.trim() &&
    !options.footerText.trim()
  ) {
    return 'missing-value';
  }
  if (
    options.mode === 'page-numbers' &&
    !/[{](current|total)[}]/u.test(options.pageNumberFormat)
  ) {
    return 'invalid-template';
  }
  if (options.mode !== 'image' && !/^#[0-9a-f]{6}$/iu.test(options.color)) {
    return 'invalid-color';
  }

  const commonNumbersAreValid =
    finite(options.horizontalMargin) &&
    options.horizontalMargin >= 0 &&
    finite(options.verticalMargin) &&
    options.verticalMargin >= 0 &&
    finite(options.rotation) &&
    finite(options.opacity) &&
    options.opacity > 0 &&
    options.opacity <= 1;
  if (!commonNumbersAreValid) return 'invalid-number';

  if (
    options.mode === 'image' &&
    (!finite(options.imageScale) || options.imageScale <= 0)
  ) {
    return 'invalid-number';
  }
  if (
    options.mode !== 'image' &&
    (!finite(options.fontSize) || options.fontSize <= 0)
  ) {
    return 'invalid-number';
  }
  if (options.mode === 'page-numbers' && !integer(options.startingPageNumber)) {
    return 'invalid-number';
  }
  if (
    options.mode === 'bates' &&
    (!integer(options.batesStart) ||
      !integer(options.batesPadding) ||
      options.batesPadding < 1 ||
      options.batesPadding > 20)
  ) {
    return 'invalid-number';
  }
  return null;
}
