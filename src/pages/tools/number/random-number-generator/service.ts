import { InitialValuesType, RandomNumberResult } from './types';

/**
 * Internal precision used for decimal generation (2 = hundredths).
 * Change this single constant to support a different precision everywhere.
 */
const DECIMAL_PRECISION = 2;
const DECIMAL_SCALE = 10 ** DECIMAL_PRECISION;

/** Safety valve for the random-sampling path (rejection sampling). */
const MAX_SAMPLING_ATTEMPTS_MULTIPLIER = 50;

/**
 * Generate random numbers within a specified range
 */
export function generateRandomNumbers(
  options: InitialValuesType
): RandomNumberResult {
  const validationError = validateInput(options);

  if (validationError) {
    throw new Error(validationError);
  }

  const {
    minValue,
    maxValue,
    count,
    allowDecimals,
    allowDuplicates,
    sortResults
  } = options;

  const numbers: number[] = [];

  if (allowDuplicates) {
    for (let i = 0; i < count; i++) {
      numbers.push(generateRandomNumber(minValue, maxValue, allowDecimals));
    }
  } else {
    const domainSize = getUniqueDomainSize(minValue, maxValue, allowDecimals);

    /**
     * If we need only a small part of the domain,
     * avoid creating the whole array.
     */
    if (count < domainSize / 4) {
      numbers.push(
        ...generateUniqueRandomValues(minValue, maxValue, count, allowDecimals)
      );
    } else {
      const domain = buildUniqueDomain(minValue, maxValue, allowDecimals);

      shuffle(domain);

      numbers.push(...domain.slice(0, count));
    }
  }

  if (sortResults) {
    numbers.sort((a, b) => a - b);
  }

  return {
    numbers,
    min: minValue,
    max: maxValue,
    count,
    // Only worth checking when duplicates were actually allowed;
    // otherwise they're guaranteed unique by construction.
    hasDuplicates: allowDuplicates ? hasDuplicatesInArray(numbers) : false,
    isSorted: sortResults
  };
}

/**
 * Calculate the amount of possible unique values
 * without creating the domain.
 */
function getUniqueDomainSize(
  min: number,
  max: number,
  allowDecimals: boolean
): number {
  if (allowDecimals) {
    return (
      Math.round(max * DECIMAL_SCALE) - Math.round(min * DECIMAL_SCALE) + 1
    );
  }

  return Math.floor(max) - Math.ceil(min) + 1;
}

/**
 * Generate unique values using random sampling.
 * Optimized when count is small compared to the domain.
 * Includes a safety valve in case of unexpectedly high collision rates.
 */
function generateUniqueRandomValues(
  min: number,
  max: number,
  count: number,
  allowDecimals: boolean
): number[] {
  const result = new Set<number>();
  const maxAttempts = Math.max(count * MAX_SAMPLING_ATTEMPTS_MULTIPLIER, 1000);
  let attempts = 0;

  while (result.size < count) {
    if (attempts >= maxAttempts) {
      // Extremely unlikely given the count < domainSize/4 guard upstream,
      // but this prevents an infinite loop if that invariant is ever broken.
      throw new Error(
        'Unable to generate enough unique values within a reasonable number of attempts'
      );
    }

    result.add(generateRandomNumber(min, max, allowDecimals));
    attempts++;
  }

  return [...result];
}

/**
 * Build bounded unique domain.
 * Decimal values use DECIMAL_PRECISION internally.
 */
function buildUniqueDomain(
  min: number,
  max: number,
  allowDecimals: boolean
): number[] {
  const domain: number[] = [];

  if (allowDecimals) {
    const start = Math.round(min * DECIMAL_SCALE);
    const end = Math.round(max * DECIMAL_SCALE);

    for (let value = start; value <= end; value++) {
      domain.push(value / DECIMAL_SCALE);
    }
  } else {
    for (let value = Math.ceil(min); value <= Math.floor(max); value++) {
      domain.push(value);
    }
  }

  return domain;
}

/**
 * Fisher-Yates shuffle
 */
function shuffle(array: number[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Generate a single random number
 */
function generateRandomNumber(
  min: number,
  max: number,
  allowDecimals: boolean
): number {
  if (allowDecimals) {
    return Number(
      (Math.random() * (max - min) + min).toFixed(DECIMAL_PRECISION)
    );
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Check duplicate values
 */
function hasDuplicatesInArray(arr: number[]): boolean {
  return new Set(arr).size !== arr.length;
}

/**
 * Format numbers for display
 */
export function formatNumbers(
  numbers: number[],
  separator: string,
  allowDecimals: boolean
): string {
  return numbers
    .map((num) =>
      allowDecimals
        ? num.toFixed(DECIMAL_PRECISION)
        : Math.round(num).toString()
    )
    .join(separator);
}

/**
 * Validate input parameters.
 * This is the single source of truth for input constraints and is
 * enforced both here (for early/explicit checks) and internally by
 * generateRandomNumbers (so it's safe to call standalone).
 */
export function validateInput(options: InitialValuesType): string | null {
  const { minValue, maxValue, count } = options;

  if (Number.isNaN(minValue) || Number.isNaN(maxValue) || Number.isNaN(count)) {
    return 'Please enter valid numbers for min, max, and count';
  }

  if (minValue >= maxValue) {
    return 'Minimum value must be less than maximum value';
  }

  if (count <= 0) {
    return 'Count must be greater than 0';
  }

  if (count > 10000) {
    return 'Count cannot exceed 10,000';
  }

  if (maxValue - minValue > 1000000) {
    return 'Range cannot exceed 1,000,000';
  }

  if (!options.allowDuplicates) {
    const domainSize = getUniqueDomainSize(
      minValue,
      maxValue,
      options.allowDecimals
    );

    if (count > domainSize) {
      return 'Count exceeds the number of unique values available in this range';
    }
  }

  return null;
}
