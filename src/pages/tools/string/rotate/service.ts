export function rotate(input: string, step: number, right: boolean): string {
  const array: string[] = input.split('');
  const length = array.length;

  if (length === 0) {
    return input; // Return early if the input is an empty string
  }

  // Normalize the step to be within the bounds of the array length
  const normalizedPositions = ((step % length) + length) % length;

  if (right) {
    // Rotate right
    return array
      .slice(-normalizedPositions)
      .concat(array.slice(0, -normalizedPositions))
      .join('');
  } else {
    // Rotate left
    return array
      .slice(normalizedPositions)
      .concat(array.slice(0, normalizedPositions))
      .join('');
  }
}

export function rotateString(
  input: string,
  step: number,
  right: boolean,
  multiLine: boolean
) {
  const result: string[] = [];
  if (multiLine) {
    const array: string[] = input.split('\n');
    for (const word of array) {
      result.push(rotate(word, step, right));
    }
  } else {
    result.push(rotate(input, step, right));
  }
  return result.join('\n');
}
