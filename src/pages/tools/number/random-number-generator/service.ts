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

  if (!allowDuplicates && count > maxValue - minValue + 1) {
    throw new Error(
      'Cannot generate unique numbers: count exceeds available range'
    );
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
    // Generate unique random numbers
    const availableNumbers = new Set<number>();

    // Create a pool of available numbers
    for (let i = minValue; i <= maxValue; i++) {
      if (allowDecimals) {
        // For decimals, we need to generate more granular values
        for (let j = 0; j < 100; j++) {
          availableNumbers.add(i + j / 100);
        }
      } else {
        availableNumbers.add(i);
      }
    }

    const availableArray = Array.from(availableNumbers);

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
