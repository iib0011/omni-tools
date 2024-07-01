export type SplitOperatorType = 'symbol' | 'regex';

// function that randomize the array
function shuffleArray(array: string[]): string[] {
    let shuffledArray = array.slice(); // Create a copy of the array
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
}

export function shuffleList(
    splitOperatorType: SplitOperatorType,
    input: string,
    splitSeparator: string,
    joinSeparator: string,
    length?: number, //  "?" is to handle the case the user let the input blank
) : string {
    let array: string[];
    let shuffledArray: string[];
    switch (splitOperatorType) {
        case 'symbol':
            array = input.split(splitSeparator);
            break;
        case 'regex':
            array = input.split(new RegExp(splitSeparator));
            break;
    }
    shuffledArray = shuffleArray(array);
    if (length !== undefined) {
        if (length <= 0) {
            throw new Error("Length value must be a positive number.");
        }
        return shuffledArray.slice(0, length).join(joinSeparator);
    }
    return shuffledArray.join(joinSeparator);
}