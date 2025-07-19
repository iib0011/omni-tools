import { expect, describe, it } from 'vitest';
import { analyzeHiddenCharacters, main } from './service';
import { InitialValuesType } from './types';

describe('Hidden Character Detector', () => {
  const defaultOptions: InitialValuesType = {
    showUnicodeCodes: true,
    highlightRTL: true,
    showInvisibleChars: true,
    includeZeroWidthChars: true
  };

  describe('analyzeHiddenCharacters', () => {
    it('should detect RTL Override characters', () => {
      const text = 'Hello\u202EWorld'; // RTL Override
      const result = analyzeHiddenCharacters(text, defaultOptions);

      expect(result.totalHiddenChars).toBe(1);
      expect(result.hasRTLOverride).toBe(true);
      expect(result.hiddenCharacters[0].isRTL).toBe(true);
      expect(result.hiddenCharacters[0].unicode).toBe('U+202E');
      expect(result.hiddenCharacters[0].name).toBe('Right-to-Left Override');
    });

    it('should detect invisible characters', () => {
      const text = 'Hello\u200BWorld'; // Zero Width Space
      const result = analyzeHiddenCharacters(text, defaultOptions);

      expect(result.totalHiddenChars).toBe(1);
      expect(result.hasInvisibleChars).toBe(true);
      expect(result.hiddenCharacters[0].isInvisible).toBe(true);
      expect(result.hiddenCharacters[0].unicode).toBe('U+200B');
      expect(result.hiddenCharacters[0].name).toBe('Zero Width Space');
    });

    it('should detect zero-width characters', () => {
      const text = 'Hello\u200CWorld'; // Zero Width Non-Joiner
      const result = analyzeHiddenCharacters(text, defaultOptions);

      expect(result.totalHiddenChars).toBe(1);
      expect(result.hasZeroWidthChars).toBe(true);
      expect(result.hiddenCharacters[0].isZeroWidth).toBe(true);
      expect(result.hiddenCharacters[0].unicode).toBe('U+200C');
    });

    it('should detect multiple hidden characters', () => {
      const text = 'Hello\u202E\u200BWorld'; // RTL Override + Zero Width Space
      const result = analyzeHiddenCharacters(text, defaultOptions);

      expect(result.totalHiddenChars).toBe(2);
      expect(result.hasRTLOverride).toBe(true);
      expect(result.hasInvisibleChars).toBe(true);
      expect(result.hasZeroWidthChars).toBe(true);
    });

    it('should detect control characters', () => {
      const text = 'Hello\u0000World'; // Null character
      const result = analyzeHiddenCharacters(text, defaultOptions);

      expect(result.totalHiddenChars).toBe(1);
      expect(result.hiddenCharacters[0].category).toBe('Control Character');
      expect(result.hiddenCharacters[0].isInvisible).toBe(true);
    });

    it('should not detect regular characters', () => {
      const text = 'Hello World';
      const result = analyzeHiddenCharacters(text, defaultOptions);

      expect(result.totalHiddenChars).toBe(0);
      expect(result.hasRTLOverride).toBe(false);
      expect(result.hasInvisibleChars).toBe(false);
      expect(result.hasZeroWidthChars).toBe(false);
    });

    it('should filter based on options', () => {
      const text = 'Hello\u202E\u200BWorld';
      const options: InitialValuesType = {
        ...defaultOptions,
        highlightRTL: false,
        showInvisibleChars: true
      };

      const result = analyzeHiddenCharacters(text, options);

      expect(result.totalHiddenChars).toBe(1); // Only invisible chars
      expect(result.hasRTLOverride).toBe(false);
      expect(result.hasInvisibleChars).toBe(true);
    });

    it('should provide correct character positions', () => {
      const text = 'Hello\u202EWorld';
      const result = analyzeHiddenCharacters(text, defaultOptions);

      expect(result.hiddenCharacters[0].position).toBe(5);
      expect(result.hiddenCharacters[0].char).toBe('\u202E');
    });
  });

  describe('main function', () => {
    it('should return message when no hidden characters found', () => {
      const text = 'Hello World';
      const result = main(text, defaultOptions);

      expect(result).toBe('No hidden characters detected in the text.');
    });

    it('should return detailed analysis when hidden characters found', () => {
      const text = 'Hello\u202EWorld';
      const result = main(text, defaultOptions);

      expect(result).toContain('Found 1 hidden character(s):');
      expect(result).toContain('Position 5: Right-to-Left Override (U+202E)');
      expect(result).toContain('Category: RTL Override');
      expect(result).toContain('⚠️  RTL Override Character');
      expect(result).toContain('WARNING: RTL Override characters detected!');
    });

    it('should include Unicode codes when showUnicodeCodes is true', () => {
      const text = 'Hello\u200BWorld';
      const options: InitialValuesType = {
        ...defaultOptions,
        showUnicodeCodes: true
      };

      const result = main(text, options);

      expect(result).toContain('Unicode: U+200B');
    });

    it('should not include Unicode codes when showUnicodeCodes is false', () => {
      const text = 'Hello\u200BWorld';
      const options: InitialValuesType = {
        ...defaultOptions,
        showUnicodeCodes: false
      };

      const result = main(text, options);

      expect(result).not.toContain('Unicode: U+200B');
    });

    it('should handle multiple RTL characters', () => {
      const text = 'Hello\u202E\u202DWorld';
      const result = main(text, defaultOptions);

      expect(result).toContain('Found 2 hidden character(s):');
      expect(result).toContain('Right-to-Left Override');
      expect(result).toContain('Left-to-Right Override');
    });

    it('should handle mixed character types', () => {
      const text = 'Hello\u202E\u200B\u200CWorld';
      const result = main(text, defaultOptions);

      expect(result).toContain('Found 3 hidden character(s):');
      expect(result).toContain('RTL Override Character');
      expect(result).toContain('Invisible Character');
      expect(result).toContain('Zero Width Character');
    });
  });

  describe('edge cases', () => {
    it('should handle empty string', () => {
      const result = analyzeHiddenCharacters('', defaultOptions);

      expect(result.totalHiddenChars).toBe(0);
      expect(result.originalText).toBe('');
    });

    it('should handle string with only hidden characters', () => {
      const text = '\u202E\u200B\u200C';
      const result = analyzeHiddenCharacters(text, defaultOptions);

      expect(result.totalHiddenChars).toBe(3);
      expect(result.hasRTLOverride).toBe(true);
      expect(result.hasInvisibleChars).toBe(true);
      expect(result.hasZeroWidthChars).toBe(true);
    });

    it('should handle very long strings', () => {
      const text = 'A'.repeat(1000) + '\u202E' + 'B'.repeat(1000);
      const result = analyzeHiddenCharacters(text, defaultOptions);

      expect(result.totalHiddenChars).toBe(1);
      expect(result.hiddenCharacters[0].position).toBe(1000);
    });
  });
});
