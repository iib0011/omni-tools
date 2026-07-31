export type SplitOperatorType = 'symbol' | 'regex';

// function that split the array into an array of subarray of desired length
function chunkMaker(array: string[], chunkNumber: number): string[][] {
  const result: string[][] = [];
  for (let i = 0; i < array.length; i += chunkNumber) {
    result.push(array.slice(i, i + chunkNumber));
  }
  return result;
}

// function use to handle the case paddingNonFullChunk is enable
function chunkFiller(
  array: string[][],
  chunkNumber: number,
  padNonFullChunk: boolean,
  paddingChar: string = ''
): string[][] {
  if (padNonFullChunk) {
    const lastSubArray: string[] = array[array.length - 1];
    if (lastSubArray.length < chunkNumber) {
      for (let i = lastSubArray.length; i < chunkNumber; i++) {
        lastSubArray.push(paddingChar);
      }
    }
    array[array.length - 1] = lastSubArray;
  }
  return array;
}

// function that join with the item separator and wrap with left and right each subArray of the Array
function chunkJoinerAndWrapper(
  array: string[][],
  itemSeparator: string = '',
  leftWrap: string = '',
  rightWrap: string = ''
): string[] {
  return array.map((subArray) => {
    return leftWrap + subArray.join(itemSeparator) + rightWrap;
  });
}

export function chunkList(
  splitOperatorType: SplitOperatorType,
  splitSeparator: string,
  input: string,
  chunkNumber: number,
  itemSeparator: string = '',
  leftWrap: string = '',
  rightWrap: string = '',
  chunkSeparator: string,
  deleteEmptyItems: boolean,
  padNonFullChunk: boolean,
  paddingChar: string = ''
): string {
  if (!splitSeparator) return '';

  let array: string[];

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
    array = array.filter((item) => item !== '');
  }

  // split the input into an array of subArray with the desired length
  const splitedArray = chunkMaker(array, chunkNumber);

  // fill the last subArray is PadNonFullChunk is enabled
  const fullSplitedArray = chunkFiller(
    splitedArray,
    chunkNumber,
    padNonFullChunk,
    paddingChar
  );

  // get the list of formated subArray with the item separator and left and right wrapper
  const result = chunkJoinerAndWrapper(
    fullSplitedArray,
    itemSeparator,
    leftWrap,
    rightWrap
  );

  // finnaly join the chunk separator before returning
  return result.join(chunkSeparator);
}
