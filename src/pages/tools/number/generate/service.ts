export function listOfIntegers(
  first_value: number,
  number_of_numbers: number,
  step: number,
  separator: string
) {
  const result: number[] = [];
  for (let i: number = 0; i < number_of_numbers; i++) {
    const value: number = first_value + i * step;
    result.push(value);
  }
  return result.join(separator);
}
