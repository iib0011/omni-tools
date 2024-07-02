import { expect, describe, it } from 'vitest';

import {
    SplitOperatorType,
    truncateList,
} from './service';

describe('truncate function', () => {
    it('should remove at the end (one element) if end is set to true', () => {
        const input: string = 'apple, pineaple, lemon, orange';
        const splitOperatorType: SplitOperatorType = 'symbol';
        const splitSeparator = ', ';
        const joinSeparator = ' ';
        const end = true;
        const length = 3;

        const result = truncateList(
            splitOperatorType,
            input,
            splitSeparator,
            joinSeparator,
            end,
            length);

        expect(result).toBe('apple pineaple lemon');

    });

    it('should return 3 elements from the start  if end is set to true', () => {
        const input: string = 'apple, pineaple, lemon, orange, mango';
        const splitOperatorType: SplitOperatorType = 'symbol';
        const splitSeparator = ', ';
        const joinSeparator = ' ';
        const end = true;
        const length = 3;

        const result = truncateList(
            splitOperatorType,
            input,
            splitSeparator,
            joinSeparator,
            end,
            length);

        expect(result).toBe('apple pineaple lemon');

    });

    it('should return 3 elements from the start   if end is set to true', () => {
        const input: string = 'apple, pineaple, lemon, orange, mango';
        const splitOperatorType: SplitOperatorType = 'symbol';
        const splitSeparator = ', ';
        const joinSeparator = ' ';
        const end = true;
        const length = 3;

        const result = truncateList(
            splitOperatorType,
            input,
            splitSeparator,
            joinSeparator,
            end,
            length);

        expect(result).toBe('apple pineaple lemon');

    });

    it('should return 3 elements from the end if end is set to true', () => {
        const input: string = 'apple, pineaple, lemon, orange, mango';
        const splitOperatorType: SplitOperatorType = 'symbol';
        const splitSeparator = ', ';
        const joinSeparator = ' ';
        const end = false;
        const length = 3;

        const result = truncateList(
            splitOperatorType,
            input,
            splitSeparator,
            joinSeparator,
            end,
            length);

        expect(result).toBe('lemon orange mango');

    });

    it('should return a void string if length is set to 0', () => {
        const input: string = 'apple, pineaple, lemon, orange, mango';
        const splitOperatorType: SplitOperatorType = 'symbol';
        const splitSeparator = ', ';
        const joinSeparator = ' ';
        const end = false;
        const length = 0;

        const result = truncateList(
            splitOperatorType,
            input,
            splitSeparator,
            joinSeparator,
            end,
            length);

        expect(result).toBe('');

    });

    it('should return an element (first) string if length is set to 1 and end is set to true', () => {
        const input: string = 'apple, pineaple, lemon, orange, mango';
        const splitOperatorType: SplitOperatorType = 'symbol';
        const splitSeparator = ', ';
        const joinSeparator = ' ';
        const end = true;
        const length = 1;

        const result = truncateList(
            splitOperatorType,
            input,
            splitSeparator,
            joinSeparator,
            end,
            length);

        expect(result).toBe('apple');

    });

    it('should return an element (last) string if length is set to 1 and end is set to false', () => {
        const input: string = 'apple, pineaple, lemon, orange, mango';
        const splitOperatorType: SplitOperatorType = 'symbol';
        const splitSeparator = ', ';
        const joinSeparator = ' ';
        const end = false;
        const length = 1;

        const result = truncateList(
            splitOperatorType,
            input,
            splitSeparator,
            joinSeparator,
            end,
            length);

        expect(result).toBe('mango');

    });

    it('should throw an error if the length value is negative', () => {
        const input: string = 'apple, pineaple, lemon, orange, mango';
        const splitOperatorType: SplitOperatorType = 'symbol';
        const splitSeparator = ', ';
        const joinSeparator = ' ';
        const end = false;
        const length = -5;

        expect(() => {
            truncateList(
                splitOperatorType,
                input,
                splitSeparator,
                joinSeparator,
                end,
                length)
        }).toThrow("Length value must be a positive number.");
    });

    it('should throw an error if the length value is left blank', () => {
        const input: string = 'apple, pineaple, lemon, orange, mango';
        const splitOperatorType: SplitOperatorType = 'symbol';
        const splitSeparator = ', ';
        const joinSeparator = ' ';
        const end = false;

        expect(() => {
            truncateList(
                splitOperatorType,
                input,
                splitSeparator,
                joinSeparator,
                end)
        }).toThrow("Length value isn't a value number.");
    });

})