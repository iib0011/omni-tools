export function mergeText(
  text: string,
  deleteBlankLines: boolean = true,
  deleteTrailingSpaces: boolean = true,
  joinCharacter: string = ''
): string {
  const lines = text.split('\n');

  let processedLines = lines;
  if (deleteBlankLines) {
    lines.map((line) =>
      deleteTrailingSpaces
        ? line
            // .split('  ')
            // .join('')
            // .replace(/|\r\n|\n|\r/gm, '')
            .trimEnd()
        : line
    );
  } else {
    lines;
  }

  if (deleteBlankLines) {
    processedLines = lines.filter(
      (line) => !deleteBlankLines || line.trim() !== ''
    );
  } else {
    lines;
  }

  return processedLines.join(joinCharacter);
}

// Example usage
const text: string = `This is a line with trailing spaces    
Another line with trailing spaces   
   
Final line without trailing spaces`;

export const mergedTextWithBlankLines: string = mergeText(text, false);
export const mergedTextWithoutBlankLines: string = mergeText(text, true);
