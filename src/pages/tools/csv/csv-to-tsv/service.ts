function unquoteIfQuoted(value: string, quoteCharacter: string): string {
  if (value.startsWith(quoteCharacter) && value.endsWith(quoteCharacter)) {
    return value.slice(1, -1); // Remove first and last character
  }
  return value;
}
export function csvToTsv(
  input: string,
  delimiter: string,
  quoteCharacter: string,
  commentCharacter: string,
  header: boolean,
  emptyLines: boolean
): string {
  // edge case: if input is empty, return empty string
  if (!input) return '';
  const lines = input.split('\n');
  // is header is set to false, remove the first line
  if (!header) lines.shift();

  const tsvLines = lines.map((line) => {
    //  if comment character is set, remove the lines that start with it
    if (commentCharacter && line.startsWith(commentCharacter)) return '';
    const cells = line.split(delimiter);
    cells.forEach((cell, index) => {
      cells[index] = unquoteIfQuoted(cell, quoteCharacter);
    });
    return cells.join('\t');
  });
  // if empty lines is set to true, remove the empty lines

  return !emptyLines
    ? tsvLines.join('\n')
    : tsvLines.filter((line) => line.trim() !== '').join('\n');
}
