import { expect, describe, it } from 'vitest';
import { randomizeCase } from './service';

describe('randomizeCase', () => {
    it('should randomize the case of each character in the string', () => {
        const input = 'hello world';
        const result = randomizeCase(input);

        // Ensure the output length is the same
        expect(result).toHaveLength(input.length);

        // Ensure each character in the input string appears in the result
        for (let i = 0; i < input.length; i++) {
            const inputChar = input[i];
            const resultChar = result[i];

            if (/[a-zA-Z]/.test(inputChar)) {
                expect([inputChar.toLowerCase(), inputChar.toUpperCase()]).toContain(resultChar);
            } else {
                expect(inputChar).toBe(resultChar);
            }
        }
    });

    it('should handle an empty string', () => {
        const input = '';
        const result = randomizeCase(input);
        expect(result).toBe('');
    });

    it('should handle a string with numbers and symbols', () => {
        const input = '123 hello! @world';
        const result = randomizeCase(input);

        // Ensure the output length is the same
        expect(result).toHaveLength(input.length);

        // Ensure numbers and symbols remain unchanged
        for (let i = 0; i < input.length; i++) {
            const inputChar = input[i];
            const resultChar = result[i];

            if (!/[a-zA-Z]/.test(inputChar)) {
                expect(inputChar).toBe(resultChar);
            }
        }
    });
});