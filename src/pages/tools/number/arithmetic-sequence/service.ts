export function generateArithmeticSequence(
  firstTerm: number,
  commonDifference: number,
  numberOfTerms: number,
  separator: string
): string {
  const sequence: number[] = [];
  for (let i = 0; i < numberOfTerms; i++) {
    const term = firstTerm + i * commonDifference;
    sequence.push(term);
  }
  return sequence.join(separator);
}
