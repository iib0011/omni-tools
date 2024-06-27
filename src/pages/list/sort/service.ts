import { isNumber } from 'utils/string';

export type SortingMethod = 'numeric' | 'alphabetic' | 'length';
export type SplitOperatorType = 'symbol' | 'regex';

// utils function that choose the way of numeric sorting mixed types of array
function customNumericSort(a: string, b: string, increasing: boolean): number {
  const formattedA = isNumber(a) ? Number(a) : a;
  const formattedB = isNumber(b) ? Number(b) : b;
  if (typeof formattedA === 'number' && typeof formattedB === 'number') {
    return increasing ? formattedA - formattedB : formattedB - formattedA;
  } else if (typeof formattedA === 'string' && typeof formattedB === 'string') {
    return formattedA.localeCompare(formattedB); // Lexicographical comparison for strings
  } else if (typeof formattedA === 'number' && typeof formattedB === 'string') {
    return -1; // Numbers before strings
  } else {
    return 1; // Strings after numbers
  }
}

export function numericSort(
  array: string[], // array we build after parsing the input
  increasing: boolean,
  joinSeparator: string,
  removeDuplicated: boolean // the value if the checkbox has been selected 1 else 0
) {
  array.sort((a, b) => customNumericSort(a, b, increasing));
  if (removeDuplicated) {
    array = array.filter((item, index) => array.indexOf(item) === index);
  }
  return array.join(joinSeparator);
}

// utils function that choose the way of numeric sorting mixed types of array
function customLengthSort(a: string, b: string, increasing: boolean): number {
  return increasing ? a.length - b.length : b.length - a.length;
}

export function lengthSort(
  array: string[], // array we build after parsing the input
  increasing: boolean, // select value has to be increasing for increasing order and decreasing for decreasing order
  joinSeparator: string,
  removeDuplicated: boolean // the value if the checkbox has been selected 1 else 0
) {
  array.sort((a, b) => customLengthSort(a, b, increasing));
  if (removeDuplicated) {
    array = array.filter((item, index) => array.indexOf(item) === index);
  }
  return array.join(joinSeparator);
}

// Utils function that chooses the way of alphabetic sorting mixed types of array
function customAlphabeticSort(
  a: string,
  b: string,
  caseSensitive: boolean
): number {
  if (!caseSensitive) {
    // Case-insensitive comparison
    return a.toLowerCase().localeCompare(b.toLowerCase());
  } else {
    // Case-sensitive comparison
    return a.charCodeAt(0) - b.charCodeAt(0);
  }
}

export function alphabeticSort(
  array: string[], // array we build after parsing the input
  increasing: boolean, // select value has to be "increasing" for increasing order and "decreasing" for decreasing order
  joinSeparator: string,
  removeDuplicated: boolean, // the value if the checkbox has been selected 1 else 0
  caseSensitive: boolean // the value if the checkbox has been selected 1 else 0
) {
  array.sort((a, b) => customAlphabeticSort(a, b, caseSensitive));
  if (!increasing) {
    array.reverse();
  }
  if (removeDuplicated) {
    array = array.filter((item, index) => array.indexOf(item) === index);
  }
  return array.join(joinSeparator);
}

// main function
export function Sort(
  sortingMethod: SortingMethod,
  splitOperatorType: SplitOperatorType,
  input: string,
  increasing: boolean,
  splitSeparator: string,
  joinSeparator: string,
  removeDuplicated: boolean,
  caseSensitive: boolean
) {
  let array: string[];
  switch (splitOperatorType) {
    case 'symbol':
      array = input.split(splitSeparator);
      break;
    case 'regex':
      array = input.split(new RegExp(splitSeparator));
      break;
  }
  let result: string;
  switch (sortingMethod) {
    case 'numeric':
      result = numericSort(array, increasing, joinSeparator, removeDuplicated);
      break;
    case 'length':
      result = lengthSort(array, increasing, joinSeparator, removeDuplicated);
      break;
    case 'alphabetic':
      result = alphabeticSort(
        array,
        increasing,
        joinSeparator,
        removeDuplicated,
        caseSensitive
      );
      break;
  }
  return result;
}
