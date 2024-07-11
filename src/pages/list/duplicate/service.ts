export type SplitOperatorType = 'symbol' | 'regex';

function interweave(
    array1: string[],
    array2: string[]) {
    const result: string[] = [];
    const maxLength = Math.max(array1.length, array2.length);

    for (let i = 0; i < maxLength; i++) {
        if (i < array1.length) result.push(array1[i]);
        if (i < array2.length) result.push(array2[i]);
    }
    return result;
}
function duplicate(
    input: string[],
    concatenate: boolean,
    reverse: boolean,
    copy?: number
) {
    if (copy) {
        if (copy > 0) {
            let result: string[] = [];
            let toAdd: string[] = [];
            let WholePart: string[] = [];
            let fractionalPart: string[] = [];
            const whole = Math.floor(copy);
            const fractional = copy - whole;
            if (!reverse) {
                WholePart = concatenate ? Array(whole).fill(input).flat() : Array(whole - 1).fill(input).flat();
                fractionalPart = input.slice(0, Math.floor(input.length * fractional));
                toAdd = WholePart.concat(fractionalPart);
                result = concatenate ? WholePart.concat(fractionalPart) : interweave(input, toAdd);
            } else {
                WholePart = Array(whole - 1).fill(input).flat().reverse()
                fractionalPart = input.slice().reverse().slice(0, Math.floor(input.length * fractional));
                toAdd = WholePart.concat(fractionalPart);
                result = concatenate ? input.concat(toAdd) : interweave(input, toAdd);
            }

            return result;
        }
        throw new Error("Number of copies cannot be negative");
    }
    throw new Error("Number of copies must be a valid number");
}

export function duplicateList(
    splitOperatorType: SplitOperatorType,
    splitSeparator: string,
    joinSeparator: string,
    input: string,
    concatenate: boolean,
    reverse: boolean,
    copy?: number
): string {
    let array: string[];
    let result: string[];
    switch (splitOperatorType) {
        case 'symbol':
            array = input.split(splitSeparator);
            break;
        case 'regex':
            array = input.split(new RegExp(splitSeparator)).filter(item => item !== '');
            break;
    }
    result = duplicate(array, concatenate, reverse, copy);
    return result.join(joinSeparator);
}