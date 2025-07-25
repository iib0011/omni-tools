import { expect, describe, it } from 'vitest';
import { generateRandomNumbers, validateInput, formatNumbers } from './service';
import { InitialValuesType } from './types';

describe('Random Number Generator Service', () => {
  describe('generateRandomNumbers', () => {
    it('should generate random numbers within the specified range', () => {
      const options: InitialValuesType = {
        minValue: 1,
        maxValue: 10,
        count: 5,
        allowDecimals: false,
        allowDuplicates: true,
        sortResults: false,
        separator: ', '
      };

      const result = generateRandomNumbers(options);

      expect(result.numbers).toHaveLength(5);
      expect(result.min).toBe(1);
      expect(result.max).toBe(10);
      expect(result.count).toBe(5);

      // Check that all numbers are within range
      result.numbers.forEach((num) => {
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(10);
        expect(Number.isInteger(num)).toBe(true);
      });
    });

    it('should generate decimal numbers when allowDecimals is true', () => {
      const options: InitialValuesType = {
        minValue: 0,
        maxValue: 1,
        count: 3,
        allowDecimals: true,
        allowDuplicates: true,
        sortResults: false,
        separator: ', '
      };

      const result = generateRandomNumbers(options);

      expect(result.numbers).toHaveLength(3);

      // Check that numbers are within range and can be decimals
      result.numbers.forEach((num) => {
        expect(num).toBeGreaterThanOrEqual(0);
        expect(num).toBeLessThanOrEqual(1);
      });
    });

    it('should generate unique numbers when allowDuplicates is false', () => {
      const options: InitialValuesType = {
        minValue: 1,
        maxValue: 5,
        count: 3,
        allowDecimals: false,
        allowDuplicates: false,
        sortResults: false,
        separator: ', '
      };

      const result = generateRandomNumbers(options);

      expect(result.numbers).toHaveLength(3);

      // Check for uniqueness
      const uniqueNumbers = new Set(result.numbers);
      expect(uniqueNumbers.size).toBe(3);
    });

    it('should sort results when sortResults is true', () => {
      const options: InitialValuesType = {
        minValue: 1,
        maxValue: 10,
        count: 5,
        allowDecimals: false,
        allowDuplicates: true,
        sortResults: true,
        separator: ', '
      };

      const result = generateRandomNumbers(options);

      expect(result.numbers).toHaveLength(5);
      expect(result.isSorted).toBe(true);

      // Check that numbers are sorted
      for (let i = 1; i < result.numbers.length; i++) {
        expect(result.numbers[i]).toBeGreaterThanOrEqual(result.numbers[i - 1]);
      }
    });

    it('should throw error when minValue >= maxValue', () => {
      const options: InitialValuesType = {
        minValue: 10,
        maxValue: 5,
        count: 5,
        allowDecimals: false,
        allowDuplicates: true,
        sortResults: false,
        separator: ', '
      };

      expect(() => generateRandomNumbers(options)).toThrow(
        'Minimum value must be less than maximum value'
      );
    });

    it('should throw error when count <= 0', () => {
      const options: InitialValuesType = {
        minValue: 1,
        maxValue: 10,
        count: 0,
        allowDecimals: false,
        allowDuplicates: true,
        sortResults: false,
        separator: ', '
      };

      expect(() => generateRandomNumbers(options)).toThrow(
        'Count must be greater than 0'
      );
    });

    it('should throw error when unique count exceeds available range', () => {
      const options: InitialValuesType = {
        minValue: 1,
        maxValue: 5,
        count: 10,
        allowDecimals: false,
        allowDuplicates: false,
        sortResults: false,
        separator: ', '
      };

      expect(() => generateRandomNumbers(options)).toThrow(
        'Cannot generate unique numbers: count exceeds available range'
      );
    });
  });

  describe('validateInput', () => {
    it('should return null for valid input', () => {
      const options: InitialValuesType = {
        minValue: 1,
        maxValue: 10,
        count: 5,
        allowDecimals: false,
        allowDuplicates: true,
        sortResults: false,
        separator: ', '
      };

      const result = validateInput(options);
      expect(result).toBeNull();
    });

    it('should return error when minValue >= maxValue', () => {
      const options: InitialValuesType = {
        minValue: 10,
        maxValue: 5,
        count: 5,
        allowDecimals: false,
        allowDuplicates: true,
        sortResults: false,
        separator: ', '
      };

      const result = validateInput(options);
      expect(result).toBe('Minimum value must be less than maximum value');
    });

    it('should return error when count <= 0', () => {
      const options: InitialValuesType = {
        minValue: 1,
        maxValue: 10,
        count: 0,
        allowDecimals: false,
        allowDuplicates: true,
        sortResults: false,
        separator: ', '
      };

      const result = validateInput(options);
      expect(result).toBe('Count must be greater than 0');
    });

    it('should return error when count > 10000', () => {
      const options: InitialValuesType = {
        minValue: 1,
        maxValue: 10,
        count: 10001,
        allowDecimals: false,
        allowDuplicates: true,
        sortResults: false,
        separator: ', '
      };

      const result = validateInput(options);
      expect(result).toBe('Count cannot exceed 10,000');
    });

    it('should return error when range > 1000000', () => {
      const options: InitialValuesType = {
        minValue: 1,
        maxValue: 1000002,
        count: 5,
        allowDecimals: false,
        allowDuplicates: true,
        sortResults: false,
        separator: ', '
      };

      const result = validateInput(options);
      expect(result).toBe('Range cannot exceed 1,000,000');
    });
  });

  describe('formatNumbers', () => {
    it('should format integers correctly', () => {
      const numbers = [1, 2, 3, 4, 5];
      const result = formatNumbers(numbers, ', ', false);
      expect(result).toBe('1, 2, 3, 4, 5');
    });

    it('should format decimals correctly', () => {
      const numbers = [1.5, 2.7, 3.2];
      const result = formatNumbers(numbers, ' | ', true);
      expect(result).toBe('1.50 | 2.70 | 3.20');
    });

    it('should handle custom separators', () => {
      const numbers = [1, 2, 3];
      const result = formatNumbers(numbers, ' -> ', false);
      expect(result).toBe('1 -> 2 -> 3');
    });

    it('should handle empty array', () => {
      const numbers: number[] = [];
      const result = formatNumbers(numbers, ', ', false);
      expect(result).toBe('');
    });
  });
});
