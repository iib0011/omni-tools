// utils function that choose the way of numeric sorting mixed types of array
function customNumericSort(a: number | string, b: number | string, increasing: boolean): number {
    if (typeof a === 'number' && typeof b === 'number') {
        let result: number = increasing ? (a - b) : (b - a);
        return result;
    } else if (typeof a === 'string' && typeof b === 'string') {
        return a.localeCompare(b); // Lexicographical comparison for strings
    } else if (typeof a === 'number' && typeof b === 'string') {
        return -1; // Numbers before strings
    } else {
        return 1; // Strings after numbers
    }
}

export function numericSort(
    array: any[], // array we build after parsing the input
    increasing: boolean,
    separator: string,
    removeDuplicated: boolean // the value if the checkbox has been selected 1 else 0
) {
    array.sort((a, b) => customNumericSort(a, b, increasing));
    if (removeDuplicated) {
        array = array.filter((item, index) => array.indexOf(item) === index);
    }
    return array.join(separator);
}

// utils function that choose the way of numeric sorting mixed types of array
function customLengthSort(a: number | string, b: number | string, increasing: boolean): number {
    let result: number = increasing ? (a.toString().length - b.toString().length) : (b.toString().length - a.toString().length);
    return result;
}

export function lengthSort(
    array: any[], // array we build after parsing the input
    increasing: boolean, // select value has to be increasing for increasing order and decreasing for decreasing order
    separator: string,
    removeDuplicated: boolean // the value if the checkbox has been selected 1 else 0
) {
    array.sort((a, b) => customLengthSort(a, b, increasing));
    if (removeDuplicated) {
        array = array.filter((item, index) => array.indexOf(item) === index);
    }
    return array.join(separator);
}

// Utils function that chooses the way of alphabetic sorting mixed types of array
function customAlphabeticSort(a: number | string, b: number | string, caseSensitive: boolean): number {
    const stringA : string = a.toString();
    const stringB : string = b.toString();

    if (!caseSensitive) {
        // Case-insensitive comparison
        return stringA.toLowerCase().localeCompare(stringB.toLowerCase());
    } else {
        // Case-sensitive comparison
        return stringA.charCodeAt(0) - stringB.charCodeAt(0);
    }
}

export function alphabeticSort(
    array: any[], // array we build after parsing the input
    increasing: boolean, // select value has to be "increasing" for increasing order and "decreasing" for decreasing order
    separator: string,
    removeDuplicated: boolean, // the value if the checkbox has been selected 1 else 0
    caseSensitive: boolean // the value if the checkbox has been selected 1 else 0
) 
{
    array.sort((a, b) => customAlphabeticSort(a, b, caseSensitive));
    if (!increasing){
        array.reverse();
    } 
    if (removeDuplicated) {
        array = array.filter((item, index) => array.indexOf(item) === index);
    }
    return array.join(separator);  
}