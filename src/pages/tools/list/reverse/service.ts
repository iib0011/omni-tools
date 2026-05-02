export type SplitOperatorType = 'symbol' | 'regex';

const MAX_REGEX_SEPARATOR_LENGTH = 200;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function reverseList(
  splitOperatorType: SplitOperatorType,
  splitSeparator: string,
  joinSeparator: string = '\n',
  input: string
): string {
  let array: string[] = [];
  switch (splitOperatorType) {
    case 'symbol':
      array = input.split(splitSeparator);
      break;
    case 'regex':
      if (splitSeparator.length > MAX_REGEX_SEPARATOR_LENGTH) {
        array = [input];
        break;
      }

      array = input
        .split(new RegExp(escapeRegExp(splitSeparator)))
        .filter((item) => item !== '');
      break;
  }

  const reversedList = array.reverse();
  return reversedList.join(joinSeparator);
}
