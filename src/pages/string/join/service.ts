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
    processedLines = processedLines.filter((line) => line.trim() !== '');
  } else {
    processedLines = processedLines.map((line) =>
      line.trim() === '' ? line + '\r\n\n' : line
    );
  }
  return processedLines.join(joinCharacter);
}

// Example text to use
`This is a line with trailing spaces    
Another line with trailing spaces   
   
Final line without trailing spaces`;
