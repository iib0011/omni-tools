export function mergeText(
  text: string,
  deleteBlankLines: boolean = true,
  deleteTrailingSpaces: boolean = true,
  joinCharacter: string = ''
): string {
  const lines = text.split('\n');

  let processedLines: string[] = lines;
  if (deleteTrailingSpaces) {
    processedLines = processedLines.map((line) => line.trimEnd());
  }

  if (deleteBlankLines) {
    processedLines = processedLines.filter((line) => line.trim());
  }

  return processedLines.join(joinCharacter);
}
