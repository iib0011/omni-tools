export type SplitOperatorType = 'symbol' | 'regex' | 'length' | 'chunks';

function splitTextByLength(text: string, length: number) {
  if (length <= 0) throw new Error('Length must be a positive number');
  const result: string[] = [];
  for (let i = 0; i < text.length; i += length) {
    result.push(text.slice(i, i + length));
  }
  return result;
}

function splitIntoChunks(text: string, numChunks: number) {
  if (numChunks <= 0)
    throw new Error('Number of chunks must be a positive number');
  const totalLength = text.length;
  if (totalLength < numChunks)
    throw new Error(
      'Text length must be at least as long as the number of chunks'
    );

  const chunkSize = Math.ceil(totalLength / numChunks); // Calculate the chunk size, rounding up to handle remainders
  let result = [];

  for (let i = 0; i < totalLength; i += chunkSize) {
    result.push(text.slice(i, i + chunkSize));
  }

  // Ensure the result contains exactly numChunks, adjusting the last chunk if necessary
  if (result.length > numChunks) {
    result[numChunks - 1] = result.slice(numChunks - 1).join(''); // Merge any extra chunks into the last chunk
    result = result.slice(0, numChunks); // Take only the first numChunks chunks
  }

  return result;
}

export function compute(
  splitSeparatorType: SplitOperatorType,
  input: string,
  symbolValue: string,
  regexValue: string,
  lengthValue: number,
  chunksValue: number,
  charBeforeChunk: string,
  charAfterChunk: string,
  outputSeparator: string
) {
  let splitText;
  switch (splitSeparatorType) {
    case 'symbol':
      splitText = input.split(symbolValue);
      break;
    case 'regex':
      splitText = input.split(new RegExp(regexValue));
      break;
    case 'length':
      splitText = splitTextByLength(input, lengthValue);
      break;
    case 'chunks':
      splitText = splitIntoChunks(input, chunksValue).map(
        (chunk) => `${charBeforeChunk}${chunk}${charAfterChunk}`
      );
  }
  return splitText.join(outputSeparator);
}
