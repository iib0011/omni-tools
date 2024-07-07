export type SplitOperatorType = 'symbol' | 'regex';
export type DisplayFormat = 'count' | 'percentage' | 'total';
export type SortingMethod = 'count' | 'alphabetic';

// Function that analyzes the array and returns a dict of element occurrences and handle the ignoreItemCase
function dictMaker(array: string[],
    ignoreItemCase: boolean
): { [key: string]: number } {
    const dict: { [key: string]: number } = {};
    for (const item of array) {
        const key = ignoreItemCase ? item.toLowerCase() : item;
        dict[key] = (dict[key] || 0) + 1;
    }
    return dict;
}

// Function that sorts the dict created with dictMaker based on the chosen sorting method
function dictSorter(
    dict: { [key: string]: number },
    sortingMethod: SortingMethod,
): { [key: string]: number } {
    let sortedArray: [string, number][];
    switch (sortingMethod) {
        case 'count':
            sortedArray = Object.entries(dict).sort(([, countA], [, countB]) => countB - countA);
            break;
        case 'alphabetic':
            sortedArray = Object.entries(dict).sort(([keyA], [keyB]) => {
                return keyA.localeCompare(keyB)
            });
            break;
        default:
            sortedArray = Object.entries(dict);
            break;
    }
    return Object.fromEntries(sortedArray);
}

// Function that prepares the output of dictSorter based on the chosen display format
function displayFormater(
    dict: { [key: string]: number },
    displayFormat: DisplayFormat
): string[] {
    let formattedOutput: string[] = [];
    const total = Object.values(dict).reduce((acc, val) => acc + val, 0);

    switch (displayFormat) {
        case 'percentage':
            Object.entries(dict).forEach(([key, value]) => {
                formattedOutput.push(`${key}: ${value} (${((value / total) * 100).toFixed(2)}%)`);
            });
            break;
        case "total":
            Object.entries(dict).forEach(([key, value]) => {
                formattedOutput.push(`${key}: ${value} (${value} / ${total})`);
            });
            break;
        case "count":
            Object.entries(dict).forEach(([key, value]) => {
                formattedOutput.push(`${key}: ${value}`);
            });
            break;
    }
    return formattedOutput;
}

export function TopItemsList(
    splitOperatorType: SplitOperatorType,
    sortingMethod: SortingMethod,
    displayFormat: DisplayFormat,
    splitSeparator: string,
    input: string,
    deleteEmptyItems: boolean,
    ignoreItemCase: boolean,
    trimItems: boolean
): string {
    let array: string[];
    switch (splitOperatorType) {
        case 'symbol':
            array = input.split(splitSeparator);
            break;
        case 'regex':
            array = input.split(new RegExp(splitSeparator)).filter(item => item !== '');
            break;
    }

    // Trim items if required
    if (trimItems) {
        array = array.map(item => item.trim());
    }

    // Delete empty items after initial split
    if (deleteEmptyItems) {
        array = array.filter(item => item !== '');
    }

    // Transform the array into dict
    const unsortedDict = dictMaker(array, ignoreItemCase);

    // Sort the list if required
    const sortedDict = dictSorter(unsortedDict, sortingMethod);

    // Format the output with desired format
    const formattedOutput = displayFormater(sortedDict, displayFormat);

    return formattedOutput.join('\n');
}
