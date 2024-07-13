export function randomizeCase(input: string): string {
  return input
    .split('')
    .map((char) =>
      Math.random() < 0.5 ? char.toLowerCase() : char.toUpperCase()
    )
    .join('');
}
