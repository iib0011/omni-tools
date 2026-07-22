import { InitialValuesType, RandomNumberResult } from './types';

/**
 * Generate random numbers within a specified range
 */
export function generateRandomNumbers(
  options: InitialValuesType
): RandomNumberResult {
  const {
    minValue,
    maxValue,
    count,
    allowDecimals,
    allowDuplicates,
    sortResults
  } = options;

  if (minValue >= maxValue) {
    throw new Error('Minimum value must be less than maximum value');
  }

  if (count <= 0) {
    throw new Error('Count must be greater than 0');
  }

  const numbers: number[] = [];

  if (allowDuplicates) {
    // Generate random numbers with possible duplicates
    for (let i = 0; i < count; i++) {
      const randomNumber = generateRandomNumber(
        minValue,
        maxValue,
        allowDecimals
      );
      numbers.push(randomNumber);
    }
  } else {
    // Build the bounded domain of distinct values that can be drawn. For
    // decimals this is every hundredth in [min, max] inclusive; for integers
    // it is every integer in [min, max] inclusive. The same domain backs the
    // capacity check, so a valid decimal count is not rejected and no drawn
    // value ever exceeds the inclusive maximum.
    const availableArray = buildUniqueDomain(minValue, maxValue, allowDecimals);

    if (count > availableArray.length) {
      throw new Error(
        'Cannot generate unique numbers: count exceeds available range'
      );
    }

    // Shuffle the available numbers
    for (let i = availableArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableArray[i], availableArray[j]] = [
        availableArray[j],
        availableArray[i]
      ];
    }

    // Take the first 'count' numbers
    for (let i = 0; i < Math.min(count, availableArray.length); i++) {
      numbers.push(availableArray[i]);
    }
  }

  // Sort if requested
  if (sortResults) {
    numbers.sort((a, b) => a - b);
  }

  return {
    numbers,
    min: minValue,
    max: maxValue,
    count,
    hasDuplicates: !allowDuplicates && hasDuplicatesInArray(numbers),
    isSorted: sortResults
  };
}

/**
 * Build the pool of distinct values that unique generation can draw from,
 * bounded by [min, max] inclusive. For decimals the granularity is hundredths
 * (matching the two-decimal display), for integers it is whole numbers.
 */
function buildUniqueDomain(
  min: number,
  max: number,
  allowDecimals: boolean
): number[] {
  const domain: number[] = [];
  if (allowDecimals) {
    const start = Math.round(min * 100);
    const end = Math.round(max * 100);
    for (let h = start; h <= end; h++) {
      domain.push(h / 100);
    }
  } else {
    for (let i = min; i <= max; i++) {
      domain.push(i);
    }
  }
  return domain;
}

/**
 * Generate a single random number within the specified range
 */
function generateRandomNumber(
  min: number,
  max: number,
  allowDecimals: boolean
): number {
  if (allowDecimals) {
    return Math.random() * (max - min) + min;
  } else {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

/**
 * Check if an array has duplicate values
 */
function hasDuplicatesInArray(arr: number[]): boolean {
  const seen = new Set<number>();
  for (const num of arr) {
    if (seen.has(num)) {
      return true;
    }
    seen.add(num);
  }
  return false;
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
    .map((num) => (allowDecimals ? num.toFixed(2) : Math.round(num).toString()))
    .join(separator);
}

/**
 * Validate input parameters
 */
export function validateInput(options: InitialValuesType): string | null {
  const { minValue, maxValue, count } = options;

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

  return null;
}
