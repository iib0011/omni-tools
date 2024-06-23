export function mergeText(
  text: string,
  deleteBlankLines: boolean = true,
  deleteTrailingSpaces: boolean = true,
  joinCharacter: string = ''
): string {
  const lines = text.split('\n');

  const processedLines = lines
    .map((line) =>
      deleteTrailingSpaces ? line.replace(/  |\r\n|\n|\r/gm, '') : line
    )
    .filter((line) => !deleteBlankLines || line.trim() !== '');

  // Join lines and remove spaces right after each line
  return processedLines.join(joinCharacter);
}

// Example usage
const text: string = `This is a line with trailing spaces    
Another line with trailing spaces   
   
Final line without trailing spaces`;

export const mergedTextWithBlankLines: string = mergeText(text, false);
console.log('With blank lines:\n', mergedTextWithBlankLines);

export const mergedTextWithoutBlankLines: string = mergeText(text, true);
console.log('Without blank lines:\n', mergedTextWithoutBlankLines);
