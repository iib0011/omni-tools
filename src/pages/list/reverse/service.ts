type SplitOperatorType = 'symbol' | 'regex';

export function reverseList(
    splitOperatorType: SplitOperatorType,
    splitSeparator: string,
    joinSeparator: string = '\n',
    input: string,
): string {
    let array: string[] = [];
    switch (splitOperatorType) {
        case 'symbol':
            array = input.split(splitSeparator);
            break;
        case 'regex':
            array = input.split(new RegExp(splitSeparator)).filter(item => item !== '');
            break;
    }

    const reversedList = array.reverse();
    return reversedList.join(joinSeparator);
}
