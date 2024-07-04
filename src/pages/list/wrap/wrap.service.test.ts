import { expect, describe, it } from 'vitest';
import {
    SplitOperatorType,
    wrapList
} from './service';

describe('wrap function', () => {
    it('should return the same input if no left and right are blanked', () => {
        const input: string = 'apple, pineaple, lemon, orange, mango';
        const splitOperatorType: SplitOperatorType = 'symbol';
        const splitSeparator = ', ';
        const joinSeparator = ', ';


        const result = wrapList(
            splitOperatorType,
            input,
            splitSeparator,
            joinSeparator,
        );

        expect(result).toBe('apple, pineaple, lemon, orange, mango');

    });

    it('should append to left if defined', () => {
        const input: string = 'apple, pineaple, lemon, orange, mango';
        const splitOperatorType: SplitOperatorType = 'symbol';
        const splitSeparator = ', ';
        const joinSeparator = ', ';
        const left = 'the ';

        const result = wrapList(
            splitOperatorType,
            input,
            splitSeparator,
            joinSeparator,
            left);

        expect(result).toBe('the apple, the pineaple, the lemon, the orange, the mango');

    });

    it('should append to right if defined', () => {
        const input: string = 'apple, pineaple, lemon, orange, mango';
        const splitOperatorType: SplitOperatorType = 'symbol';
        const splitSeparator = ', ';
        const joinSeparator = ', ';
        const left = '';
        const right = 'z';

        const result = wrapList(
            splitOperatorType,
            input,
            splitSeparator,
            joinSeparator,
            left,
            right);

        expect(result).toBe('applez, pineaplez, lemonz, orangez, mangoz');
    });

    it('should append to both side if both defined', () => {
        const input: string = 'apple, pineaple, lemon, orange, mango';
        const splitOperatorType: SplitOperatorType = 'symbol';
        const splitSeparator = ', ';
        const joinSeparator = ', ';
        const left = 'K';
        const right = 'z';

        const result = wrapList(
            splitOperatorType,
            input,
            splitSeparator,
            joinSeparator,
            left,
            right);

        expect(result).toBe('Kapplez, Kpineaplez, Klemonz, Korangez, Kmangoz');

    });


})