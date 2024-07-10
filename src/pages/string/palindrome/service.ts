export type SplitOperatorType = 'symbol' | 'regex';

function isPalindrome(
    word: string,
    left: number,
    right: number
): boolean {
    if (left >= right) return true;
    if (word[left] !== word[right]) return false;

    return isPalindrome(word, left + 1, right - 1);
}

// check each word of the input and add the palindrome status in an array
function checkPalindromes(array: string[]): boolean[] {
    let status: boolean[] = [];
    for (const word of array) {
        const palindromeStatus = isPalindrome(word, 0, word.length - 1);
        status.push(palindromeStatus);
    }
    return status;
}

export function palindromeList(
    splitOperatorType: SplitOperatorType,
    input: string,
    separator: string, // the splitting separator will be the joining separator for visual satisfaction
): string {
    if (!input) return '';
    let array: string[];
    switch (splitOperatorType) {
        case 'symbol':
            array = input.split(separator);
            break;
        case 'regex':
            array = input.split(new RegExp(separator));
            break;
    }
    // trim all items to focus on the word and not biasing the result due to spaces (leading and trailing)
    array = array.map((item) => item.trim());

    const statusArray = checkPalindromes(array);

    return statusArray.map(status => status.toString()).join(separator);

}

