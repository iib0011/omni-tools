// Import necessary modules and functions
import { describe, it, expect } from 'vitest';
import { listOfIntegers} from './service';

// Define test cases for the listOfIntegers function
describe('listOfIntegers function', () => {
    it('should generate a list of integers with comma separator', () => {
        const initialValue = 1;
        const step = 2;
        const count = 5;
        const separator = ', ';

        const result = listOfIntegers(initialValue, count, step, separator);
        expect(result).toBe('1, 3, 5, 7, 9');
    });

    it('should generate a list of integers with dash separator', () => {
        const initialValue = 0;
        const step = 3;
        const count = 4;
        const separator = ' - ';

        const result = listOfIntegers(initialValue, count, step, separator);
        expect(result).toBe('0 - 3 - 6 - 9');
    });

    it('should handle negative initial value and step', () => {
        const initialValue = -10;
        const step = -2;
        const count = 5;
        const separator = ' ';

        const result = listOfIntegers(initialValue, count, step, separator);
        expect(result).toBe('-10 -12 -14 -16 -18');
    }); 

    it('should handle negative initial value and positive step', () => {
        const initialValue = -10;
        const step = 2;
        const count = 5;
        const separator = ' ';

        const result = listOfIntegers(initialValue, count, step, separator);
        expect(result).toBe('-10 -8 -6 -4 -2');
    }); 

    it('should float value', () => {
        const initialValue = -10;
        const step = 2.5;
        const count = 5;
        const separator = ' ';

        const result = listOfIntegers(initialValue, count, step, separator);
        expect(result).toBe('-10 -7.5 -5 -2.5 0');
    }); 

    it('should generate a constant sequence if the step is 0', () => {
        const initialValue =  1;
        const step = 0;
        const count = 5;
        const separator = ' ';

        const result = listOfIntegers(initialValue, count, step, separator);
        expect(result).toBe('1 1 1 1 1');
    }); 

    it('should generate a constant sequence if the step is 0', () => {
        const initialValue =  1;
        const step = 0;
        const count = 5;
        const separator = ' ';

        const result = listOfIntegers(initialValue, count, step, separator);
        expect(result).toBe('1 1 1 1 1');
    }); 
});
