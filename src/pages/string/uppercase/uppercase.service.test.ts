import { expect, describe, it } from 'vitest';
import { toUppercase } from './service';

describe('toUppercase', () => {
    test('should convert a lowercase string to uppercase', () => {
        const input = 'hello';
        const result = toUppercase(input);
        expect(result).toBe('HELLO');
    });

    test('should convert a mixed case string to uppercase', () => {
        const input = 'HeLLo WoRLd';
        const result = toUppercase(input);
        expect(result).toBe('HELLO WORLD');
    });

    test('should convert an already uppercase string to uppercase', () => {
        const input = 'HELLO';
        const result = toUppercase(input);
        expect(result).toBe('HELLO');
    });

    test('should handle an empty string', () => {
        const input = '';
        const result = toUppercase(input);
        expect(result).toBe('');
    });

    test('should handle a string with numbers and symbols', () => {
        const input = '123 hello! @world';
        const result = toUppercase(input);
        expect(result).toBe('123 HELLO! @WORLD');
    });
});