export type SplitOperatorType = 'symbol' | 'regex';


// function that split the array into an array of subarray of desired length
function groupMaker(
    array: string[],
    groupNumber: number,
): string[][] {
    const result: string[][] = [];
    for (let i = 0; i < array.length; i += groupNumber) {
        result.push(array.slice(i, i + groupNumber));
    }
    return result;
}

// function use to handle the case paddingNonFullGroup is enable
function groupFiller(
    array: string[][],
    groupNumber: number,
    padNonFullGroup: boolean,
    paddingChar: string = '',
): string[][] {
    if (padNonFullGroup) {
        const lastSubArray: string[] = array[array.length - 1];
        if (lastSubArray.length < groupNumber) {
            for (let i = lastSubArray.length; i < groupNumber; i++) {
                lastSubArray.push(paddingChar);
            }
        }
        array[array.length - 1] = lastSubArray;
    }
    return array;

}

// function that join with the item separator and wrap with left and right each subArray of the Array
function groupJoinerAndWrapper(
    array: string[][],
    itemSeparator: string = '',
    leftWrap: string = '',
    rightWrap: string = '',
): string[] {
    return array.map(subArray => {
        return leftWrap + subArray.join(itemSeparator) + rightWrap;
    });
}


export function groupList(
    splitOperatorType: SplitOperatorType,
    splitSeparator: string,
    input: string,
    groupNumber: number,
    itemSeparator: string = '',
    leftWrap: string = '',
    rightWrap: string = '',
    groupSeparator: string,
    deleteEmptyItems: boolean,
    padNonFullGroup: boolean,
    paddingChar: string = '',

): string {
    let array: string[];
    let splitedArray: string[][];
    let fullSplitedArray: string[][];
    let result: string[];
    switch (splitOperatorType) {
        case 'symbol':
            array = input.split(splitSeparator);
            break;
        case 'regex':
            array = input.split(new RegExp(splitSeparator));
            break;
    }
    // delete empty items after intial split
    if (deleteEmptyItems) {
        array = array.filter(item => item !== '');
    }

    // split the input into an array of subArray with the desired length
    splitedArray = groupMaker(array, groupNumber);

    // fill the last subArray is PadNonFullGroup is enabled
    fullSplitedArray = groupFiller(splitedArray, groupNumber, padNonFullGroup, paddingChar);

    // get the list of formated subArray with the item separator and left and right wrapper
    result = groupJoinerAndWrapper(fullSplitedArray, itemSeparator, leftWrap, rightWrap);

    // finnaly join the group separator before returning
    return result.join(groupSeparator);
}

