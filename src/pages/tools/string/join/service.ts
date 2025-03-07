export function mergeText(
  text: string,
  deleteBlankLines: boolean = true,
  deleteTrailingSpaces: boolean = true,
  joinCharacter: string = ''
): string {
  let processedLines: string[] = text.split('\n');
  if (deleteTrailingSpaces) {
    processedLines = processedLines.map((line) => line.trimEnd());
  }

  if (deleteBlankLines) {
    processedLines = processedLines.filter((line) => line.trim());
  }

  return processedLines.join(joinCharacter);
}
