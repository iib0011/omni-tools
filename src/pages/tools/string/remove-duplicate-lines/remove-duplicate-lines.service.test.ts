import { describe, expect, it } from 'vitest';
import removeDuplicateLines, { DuplicateRemoverOptions } from './service';

describe('removeDuplicateLines function', () => {
  // Test for 'all' duplicate removal mode
  describe('mode: all', () => {
    it('should remove all duplicates keeping first occurrence', () => {
      const input = 'line1\nline2\nline1\nline3\nline2';
      const options: DuplicateRemoverOptions = {
        mode: 'all',
        newlines: 'filter',
        sortLines: false,
        trimTextLines: false
      };
      const result = removeDuplicateLines(input, options);
      expect(result).toBe('line1\nline2\nline3');
    });

    it('should handle case-sensitive duplicates correctly', () => {
      const input = 'Line1\nline1\nLine2\nline2';
      const options: DuplicateRemoverOptions = {
        mode: 'all',
        newlines: 'filter',
        sortLines: false,
        trimTextLines: false
      };
      const result = removeDuplicateLines(input, options);
      expect(result).toBe('Line1\nline1\nLine2\nline2');
    });
  });

  // Test for 'consecutive' duplicate removal mode
  describe('mode: consecutive', () => {
    it('should remove only consecutive duplicates', () => {
      const input = 'line1\nline1\nline2\nline3\nline3\nline1';
      const options: DuplicateRemoverOptions = {
        mode: 'consecutive',
        newlines: 'filter',
        sortLines: false,
        trimTextLines: false
      };
      const result = removeDuplicateLines(input, options);
      expect(result).toBe('line1\nline2\nline3\nline1');
    });
  });

  // Test for 'unique' duplicate removal mode
  describe('mode: unique', () => {
    it('should keep only lines that appear exactly once', () => {
      const input = 'line1\nline2\nline1\nline3\nline4\nline4';
      const options: DuplicateRemoverOptions = {
        mode: 'unique',
        newlines: 'filter',
        sortLines: false,
        trimTextLines: false
      };
      const result = removeDuplicateLines(input, options);
      expect(result).toBe('line2\nline3');
    });
  });

  // Test for newlines handling
  describe('newlines option', () => {
    it('should filter newlines when newlines is set to filter', () => {
      const input = 'line1\n\nline2\n\n\nline3';
      const options: DuplicateRemoverOptions = {
        mode: 'all',
        newlines: 'filter',
        sortLines: false,
        trimTextLines: false
      };
      const result = removeDuplicateLines(input, options);
      expect(result).toBe('line1\n\nline2\nline3');
    });

    it('should delete newlines when newlines is set to delete', () => {
      const input = 'line1\n\nline2\n\n\nline3';
      const options: DuplicateRemoverOptions = {
        mode: 'all',
        newlines: 'delete',
        sortLines: false,
        trimTextLines: false
      };
      const result = removeDuplicateLines(input, options);
      expect(result).toBe('line1\nline2\nline3');
    });

    it('should preserve newlines when newlines is set to preserve', () => {
      const input = 'line1\n\nline2\n\nline2\nline3';
      const options: DuplicateRemoverOptions = {
        mode: 'all',
        newlines: 'preserve',
        sortLines: false,
        trimTextLines: false
      };
      const result = removeDuplicateLines(input, options);
      // This test needs careful consideration of the expected behavior
      expect(result).not.toContain('line2\nline2');
      expect(result).toContain('line1');
      expect(result).toContain('line2');
      expect(result).toContain('line3');
    });
  });

  // Test for sorting
  describe('sortLines option', () => {
    it('should sort lines when sortLines is true', () => {
      const input = 'line3\nline1\nline2';
      const options: DuplicateRemoverOptions = {
        mode: 'all',
        newlines: 'filter',
        sortLines: true,
        trimTextLines: false
      };
      const result = removeDuplicateLines(input, options);
      expect(result).toBe('line1\nline2\nline3');
    });
  });

  // Test for trimming
  describe('trimTextLines option', () => {
    it('should trim lines when trimTextLines is true', () => {
      const input = '  line1  \n  line2  \nline3';
      const options: DuplicateRemoverOptions = {
        mode: 'all',
        newlines: 'filter',
        sortLines: false,
        trimTextLines: true
      };
      const result = removeDuplicateLines(input, options);
      expect(result).toBe('line1\nline2\nline3');
    });

    it('should consider trimmed lines as duplicates', () => {
      const input = '  line1  \nline1\n  line2\nline2  ';
      const options: DuplicateRemoverOptions = {
        mode: 'all',
        newlines: 'filter',
        sortLines: false,
        trimTextLines: true
      };
      const result = removeDuplicateLines(input, options);
      expect(result).toBe('line1\nline2');
    });
  });

  // Combined scenarios
  describe('combined options', () => {
    it('should handle all options together correctly', () => {
      const input = '  line3  \nline1\n\nline3\nline2\nline1';
      const options: DuplicateRemoverOptions = {
        mode: 'all',
        newlines: 'delete',
        sortLines: true,
        trimTextLines: true
      };
      const result = removeDuplicateLines(input, options);
      expect(result).toBe('line1\nline2\nline3');
    });
  });

  // Edge cases
  describe('edge cases', () => {
    it('should handle empty input', () => {
      const input = '';
      const options: DuplicateRemoverOptions = {
        mode: 'all',
        newlines: 'filter',
        sortLines: false,
        trimTextLines: false
      };
      const result = removeDuplicateLines(input, options);
      expect(result).toBe('');
    });

    it('should handle input with only newlines', () => {
      const input = '\n\n\n';
      const options: DuplicateRemoverOptions = {
        mode: 'all',
        newlines: 'filter',
        sortLines: false,
        trimTextLines: false
      };
      const result = removeDuplicateLines(input, options);
      expect(result).toBe('');
    });

    it('should handle input with only whitespace', () => {
      const input = '   \n  \n    ';
      const options: DuplicateRemoverOptions = {
        mode: 'all',
        newlines: 'filter',
        sortLines: false,
        trimTextLines: true
      };
      const result = removeDuplicateLines(input, options);
      expect(result).toBe('');
    });
  });
});
