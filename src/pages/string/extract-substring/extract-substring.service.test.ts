import { expect, describe, it } from 'vitest';
import { extractSubstring } from './service';

describe('extractSubstring', () => {
    it('should extract a substring from single-line input', () => {
        const input = 'hello world';
        const result = extractSubstring(input, 1, 4, false, false);
        expect(result).toBe('hell');
    });

    it('should extract and reverse a substring from single-line input', () => {
        const input = 'hello world';
        const result = extractSubstring(input, 1, 5, false, true);
        expect(result).toBe('olleh');
    });

    it('should extract substrings from multi-line input', () => {
        const input = 'hello\nworld';
        const result = extractSubstring(input, 1, 5, true, false);
        expect(result).toBe('hello\nworld');
    });

    it('should extract and reverse substrings from multi-line input', () => {
        const input = 'hello\nworld';
        const result = extractSubstring(input, 1, 4, true, true);
        expect(result).toBe('lleh\nlrow');
    });

    it('should handle empty input', () => {
        const input = '';
        const result = extractSubstring(input, 1, 5, false, false);
        expect(result).toBe('');
    });

    it('should handle start and length out of bounds', () => {
        const input = 'hello';
        const result = extractSubstring(input, 10, 5, false, false);
        expect(result).toBe('');
    });

    it('should handle negative start and length', () => {
        expect(() => extractSubstring('hello', -1, 5, false, false)).toThrow("Start index must be greater than zero.");
        expect(() => extractSubstring('hello', 1, -5, false, false)).toThrow("Length value must be greater than or equal to zero.");
    });

    it('should handle zero length', () => {
        const input = 'hello';
        const result = extractSubstring(input, 1, 0, false, false);
        expect(result).toBe('');
    });

    it('should work', () => {
        const input = 'je me nomme king\n22 est mon chiffre';
        const result = extractSubstring(input, 12, 7, true, false);
        expect(result).toBe(' king\nchiffre');
    });
});