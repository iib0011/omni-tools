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

  const chunkSize = Math.floor(totalLength / numChunks);
  const remainder = totalLength % numChunks;
  const result: string[] = [];
  let offset = 0;

  for (let i = 0; i < numChunks; i++) {
    const currentSize = chunkSize + (i < remainder ? 1 : 0);
    result.push(text.slice(offset, offset + currentSize));
    offset += currentSize;
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
