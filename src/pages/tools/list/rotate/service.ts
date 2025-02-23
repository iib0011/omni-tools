export type SplitOperatorType = 'symbol' | 'regex';

function rotateArray(array: string[], step: number, right: boolean): string[] {
  const length = array.length;

  // Normalize the step to be within the bounds of the array length
  const normalizedPositions = ((step % length) + length) % length;

  if (right) {
    // Rotate right
    return array
      .slice(-normalizedPositions)
      .concat(array.slice(0, -normalizedPositions));
  } else {
    // Rotate left
    return array
      .slice(normalizedPositions)
      .concat(array.slice(0, normalizedPositions));
  }
}

export function rotateList(
  splitOperatorType: SplitOperatorType,
  input: string,
  splitSeparator: string,
  joinSeparator: string,
  right: boolean,
  step?: number
): string {
  let array: string[];
  let rotatedArray: string[];
  switch (splitOperatorType) {
    case 'symbol':
      array = input.split(splitSeparator);
      break;
    case 'regex':
      array = input.split(new RegExp(splitSeparator));
      break;
  }
  if (step !== undefined) {
    if (step <= 0) {
      throw new Error('Rotation step must be greater than zero.');
    }
    rotatedArray = rotateArray(array, step, right);
    return rotatedArray.join(joinSeparator);
  }
  throw new Error('Rotation step contains non-digits.');
}
