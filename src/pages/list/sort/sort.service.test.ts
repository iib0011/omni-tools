// Import necessary modules and functions
import { describe, it, expect } from 'vitest';
import {
    alphabeticSort, lengthSort, numericSort, Sort,
    SplitOperatorType, SortingMethod
} from './service';

// Define test cases for the numericSort function
describe('numericSort function', () => {
    it('should sort a list in increasing order with comma separator not removeduplicated elements', () => {
        const array: string[] = ['9', '8', '7', '4', '2', '2', '5'];
        const increasing: boolean = true;
        const separator = ', ';
        const removeDuplicated: boolean = false;

        const result = numericSort(array, increasing, separator, removeDuplicated);
        expect(result).toBe('2, 2, 4, 5, 7, 8, 9');
    });

    it('should sort a list in decreasing order with " - " separator and remove duplicated elements', () => {
        const array: string[] = ['2', '4', '4', '9', '6', '6', '7'];
        const increasing: boolean = false;
        const separator = ' - ';
        const removeDuplicated: boolean = true;


        const result = numericSort(array, increasing, separator, removeDuplicated);
        expect(result).toBe('9 - 7 - 6 - 4 - 2');
    });

    it('should sort a list with numbers and characters and remove duplicated elements', () => {
        const array: string[] = ['d', 'd', 'n', 'p', 'h', 'h', '6', '9', '7', '5'];
        const increasing: boolean = true;
        const separator = ' ';
        const removeDuplicated: boolean = true;


        const result = numericSort(array, increasing, separator, removeDuplicated);
        expect(result).toBe('5 6 7 9 d h n p');
    });

    // Define test cases for the lengthSort function
    describe('lengthSort function', () => {
        it('should sort a list of number by length in increasing order with comma separator ', () => {
            const array: string[] = ['415689521', '3', '126', '12', '1523'];
            const increasing: boolean = true;
            const separator = ', ';
            const removeDuplicated: boolean = false;

            const result = lengthSort(array, increasing, separator, removeDuplicated);
            expect(result).toBe('3, 12, 126, 1523, 415689521');
        });

        it('should sort a list of number by length in increasing order and remove duplicated elements ', () => {
            const array: string[] = ['415689521', '3', '3', '126', '12', '12', '1523'];
            const increasing: boolean = true;
            const separator = ', ';
            const removeDuplicated: boolean = true;

            const result = lengthSort(array, increasing, separator, removeDuplicated);
            expect(result).toBe('3, 12, 126, 1523, 415689521');
        });

        it('should sort a mixed array by length in increasing order ', () => {
            const array: string[] = ['ddd', 'd', 'nfg', 'p', 'h', 'h', '6555', '9', '7', '5556'];
            const increasing: boolean = true;
            const separator = ' ';
            const removeDuplicated: boolean = true;

            const result = lengthSort(array, increasing, separator, removeDuplicated);
            expect(result).toBe('d p h 9 7 ddd nfg 6555 5556');
        });


    });

    // Define test cases for the alphabeticSort function
    describe('alphabeticSort function', () => {
        // NON CASE SENSITIVE TEST
        it('should sort a list of string in increasing order with comma separator ', () => {
            const array: string[] = ['apple', 'pineaple', 'lemon', 'orange'];
            const increasing: boolean = true;
            const separator = ', ';
            const removeDuplicated: boolean = false;
            const caseSensitive: boolean = false;

            const result = alphabeticSort(array, increasing, separator, removeDuplicated, caseSensitive);
            expect(result).toBe('apple, lemon, orange, pineaple');
        });

        it('should sort a list of string in decreasing order with comma separator ', () => {
            const array: string[] = ['apple', 'pineaple', 'lemon', 'orange'];
            const increasing: boolean = false;
            const separator = ', ';
            const removeDuplicated: boolean = false;
            const caseSensitive: boolean = false;

            const result = alphabeticSort(array, increasing, separator, removeDuplicated, caseSensitive);
            expect(result).toBe('pineaple, orange, lemon, apple');
        });

        it('should sort a list of string and symbols (uppercase and lower) in increasing order with comma separator ', () => {
            const array: string[] = ['Apple', 'pineaple', 'lemon', 'Orange', '1', '9', '@', '+'];
            const increasing: boolean = true;
            const separator = ' ';
            const removeDuplicated: boolean = true;
            const caseSensitive: boolean = false;

            const result = alphabeticSort(array, increasing, separator, removeDuplicated, caseSensitive);
            expect(result).toBe('@ + 1 9 Apple lemon Orange pineaple');
        });

        it('should sort a list of string and symbols (uppercase and lower) in decreasing order with comma separator ', () => {
            const array: string[] = ['Apple', 'pineaple', 'lemon', 'Orange', '1', '9', '@', '+'];
            const increasing: boolean = false;
            const separator = ' ';
            const removeDuplicated: boolean = true;
            const caseSensitive: boolean = false;

            const result = alphabeticSort(array, increasing, separator, removeDuplicated, caseSensitive);
            expect(result).toBe('pineaple Orange lemon Apple 9 1 + @');
        });


        // CASE SENSITIVE TEST
        it('should sort a list of string (uppercase) in decreasing order with comma separator ', () => {
            const array: string[] = ['Apple', 'Pineaple', 'Lemon', 'Orange'];
            const increasing: boolean = false;
            const separator = ' ';
            const removeDuplicated: boolean = false;
            const caseSensitive: boolean = true;

            const result = alphabeticSort(array, increasing, separator, removeDuplicated, caseSensitive);
            expect(result).toBe('Pineaple Orange Lemon Apple');
        });

        it('should sort a list of string (uppercase and lowercase) in increasing order with comma separator ', () => {
            const array: string[] = ['Apple', 'pineaple', 'lemon', 'Orange', '1', '9'];
            const increasing: boolean = true;
            const separator = ' ';
            const removeDuplicated: boolean = true;
            const caseSensitive: boolean = true;

            const result = alphabeticSort(array, increasing, separator, removeDuplicated, caseSensitive);
            expect(result).toBe('1 9 Apple Orange lemon pineaple');
        });

        it('should sort a list of string (uppercase and lower) in decreasing order with comma separator ', () => {
            const array: string[] = ['Apple', 'pineaple', 'lemon', 'Orange', '1', '9'];
            const increasing: boolean = false;
            const separator = ' ';
            const removeDuplicated: boolean = true;
            const caseSensitive: boolean = true;

            const result = alphabeticSort(array, increasing, separator, removeDuplicated, caseSensitive);
            expect(result).toBe('pineaple lemon Orange Apple 9 1');
        });

        it('should sort a list of string and symbols (uppercase and lower) in decreasing order with comma separator ', () => {
            const array: string[] = ['Apple', 'pineaple', 'lemon', 'Orange', '1', '9', '@', '+'];
            const increasing: boolean = true;
            const separator = ' ';
            const removeDuplicated: boolean = true;
            const caseSensitive: boolean = true;

            const result = alphabeticSort(array, increasing, separator, removeDuplicated, caseSensitive);
            expect(result).toBe('+ 1 9 @ Apple Orange lemon pineaple');
        });

        it('should sort a list of string and symbols (uppercase and lower) in decreasing order with comma separator ', () => {
            const array: string[] = ['Apple', 'pineaple', 'lemon', 'Orange', '1', '9', '@', '+'];
            const increasing: boolean = false;
            const separator = ' ';
            const removeDuplicated: boolean = true;
            const caseSensitive: boolean = true;

            const result = alphabeticSort(array, increasing, separator, removeDuplicated, caseSensitive);
            expect(result).toBe('pineaple lemon Orange Apple @ 9 1 +');
        });
    });

    // Define test cases for the lengthSort function
    describe('main function', () => {
        it('should do everything alph', () => {
            const sortingMethod: SortingMethod = 'alphabetic';
            const splitOperatorType : SplitOperatorType = 'symbol';
            const input: string = 'Apple pineaple lemon Orange 1 9 @ +';
            const increasing: boolean = true;
            const splitSeparator: string = ' ';
            const joinSeparator: string = ' ';
            const removeDuplicated: boolean = true;
            const caseSensitive: boolean = true;

            const result = Sort(sortingMethod, splitOperatorType, input, increasing, splitSeparator, joinSeparator, removeDuplicated, caseSensitive);
            expect(result).toBe('+ 1 9 @ Apple Orange lemon pineaple');
        });

        it('should do everything numeric', () => {
            const sortingMethod: SortingMethod = 'numeric';
            const splitOperatorType : SplitOperatorType = 'symbol';
            const input: string = '1 6 9 4 6 7 3 5 8';
            const increasing: boolean = true;
            const splitSeparator: string = ' ';
            const joinSeparator: string = ' ';
            const removeDuplicated: boolean = true;
            const caseSensitive: boolean = true;

            const result = Sort(sortingMethod, splitOperatorType, input, increasing, splitSeparator, joinSeparator, removeDuplicated, caseSensitive);
            expect(result).toBe('1 3 4 5 6 7 8 9');
        });


    });

});