export type SplitOperatorType = 'symbol' | 'regex';

// Function that builds the unique items array handling caseSensitive and absolutelyUnique options
function uniqueListBuilder(
    array: string[],
    caseSensitive: boolean,
    absolutelyUnique: boolean
): string[] {
    const dict: { [key: string]: number } = {};
    for (const item of array) {
        const key = caseSensitive ? item : item.toLowerCase();
        dict[key] = (dict[key] || 0) + 1;
    }
    if (absolutelyUnique) {
        for (const [key, value] of Object.entries(dict)) {
            if (value > 1) {
                delete dict[key];
            }
        }
    }
    return Object.keys(dict);
}

export function TopItemsList(
    splitOperatorType: SplitOperatorType,
    splitSeparator: string,
    joinSeparator: string = '\n',
    input: string,
    deleteEmptyItems: boolean,
    trimItems: boolean,
    caseSensitive: boolean,
    absolutelyUnique: boolean
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

    // Format the output with desired format
    const uniqueListItems = uniqueListBuilder(array, caseSensitive, absolutelyUnique);

    return uniqueListItems.join(joinSeparator);
}
