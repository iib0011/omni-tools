import { string } from "yup";

// utils function that choose the way of numeric sorting mixed types of array
function customNumericSort(a: number | string, b: number | string, order: string): number {
    if (typeof a === 'number' && typeof b === 'number') {
        let result: number = order === "increasing" ? (a - b) : (b - a);
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
    order: string, // select value has to be increasing for increasing order and decreasing for decreasing order (set a default value)
    separator: string,
    remove_duplicated: number // the value if the checkbox has been selected 1 else 0
) {
    array.sort((a, b) => customNumericSort(a, b, order));
    if (remove_duplicated === 1) {
        array = array.filter((item, index) => array.indexOf(item) === index);
    }
    return array.join(separator);
}

// utils function that choose the way of numeric sorting mixed types of array
function customLengthSort(a: number | string, b: number | string, order: string): number {
    let result: number = order === "increasing" ? (a.toString().length - b.toString().length) : (b.toString().length - a.toString().length);
    return result;
}

export function lengthSort(
    array: any[], // array we build after parsing the input
    order: string, // select value has to be increasing for increasing order and decreasing for decreasing order
    separator: string,
    remove_duplicated: number // the value if the checkbox has been selected 1 else 0
) {
    array.sort((a, b) => customLengthSort(a, b, order));
    if (remove_duplicated === 1) {
        array = array.filter((item, index) => array.indexOf(item) === index);
    }
    return array.join(separator);
}

// Utils function that chooses the way of alphabetic sorting mixed types of array
function customAlphabeticSort(a: number | string, b: number | string, case_sensitive: number): number {
    const stringA : string = a.toString();
    const stringB : string = b.toString();

    if (case_sensitive === 0) {
        // Case-insensitive comparison
        return stringA.toLowerCase().localeCompare(stringB.toLowerCase());
    } else {
        // Case-sensitive comparison
        return stringA.charCodeAt(0) - stringB.charCodeAt(0);
    }
}

export function alphabeticSort(
    array: any[], // array we build after parsing the input
    order: string, // select value has to be "increasing" for increasing order and "decreasing" for decreasing order
    separator: string,
    remove_duplicated: number, // the value if the checkbox has been selected 1 else 0
    case_sensitive: number // the value if the checkbox has been selected 1 else 0
) 
{
    array.sort((a, b) => customAlphabeticSort(a, b, case_sensitive));
    if (order === "decreasing"){
        array.reverse();
    } 
    if (remove_duplicated === 1) {
        array = array.filter((item, index) => array.indexOf(item) === index);
    }
    return array.join(separator);

    
}