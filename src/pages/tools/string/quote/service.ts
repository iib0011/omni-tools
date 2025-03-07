export function quote(
  word: string,
  leftQuote: string,
  rightQuote: string,
  doubleQuotation: boolean
): string {
  const array: string[] = word.split('');

  // Check if double quotation is enabled and adjust accordingly
  if (doubleQuotation) {
    array.unshift(leftQuote);
    array.push(rightQuote);
  } else {
    // Check if the word is already quoted correctly
    if (array[0] === leftQuote && array[array.length - 1] === rightQuote) {
      return word;
    }

    // Append quotes if not already quoted
    array.unshift(leftQuote);
    array.push(rightQuote);
  }

  return array.join('');
}

export function stringQuoter(
  input: string,
  leftQuote: string,
  rightQuote: string,
  doubleQuotation: boolean,
  emptyQuoting: boolean,
  multiLine: boolean
) {
  if (!input) {
    return '';
  }
  let arrayOfString: string[] = [];
  const result: string[] = [];
  if (multiLine) {
    arrayOfString = input.split('\n');
  } else {
    arrayOfString.push(input);
  }
  for (const word of arrayOfString) {
    if (word === '') {
      if (emptyQuoting) {
        result.push(quote(word, leftQuote, rightQuote, doubleQuotation));
      } else {
        result.push(word);
      }
    } else {
      result.push(quote(word, leftQuote, rightQuote, doubleQuotation));
    }
  }
  return result.join('\n');
}
