export type NewlineOption = 'preserve' | 'filter' | 'delete';
export type DuplicateRemovalMode = 'all' | 'consecutive' | 'unique';

export interface DuplicateRemoverOptions {
  mode: DuplicateRemovalMode;
  newlines: NewlineOption;
  sortLines: boolean;
  trimTextLines: boolean;
}

/**
 * Removes duplicate lines from text based on specified options
 * @param text The input text to process
 * @param options Configuration options for text processing
 * @returns Processed text with duplicates removed according to options
 */
export default function removeDuplicateLines(
  text: string,
  options: DuplicateRemoverOptions
): string {
  // Split the text into individual lines
  let lines = text.split('\n');

  // Process newlines based on option
  if (options.newlines === 'delete') {
    // Remove all empty lines
    lines = lines.filter((line) => line.trim() !== '');
  }

  // Trim lines if option is selected
  if (options.trimTextLines) {
    lines = lines.map((line) => line.trim());
  }

  // Remove duplicates based on mode
  let processedLines: string[] = [];

  if (options.mode === 'all') {
    // Remove all duplicates, keeping only first occurrence
    const seen = new Set<string>();
    processedLines = lines.filter((line) => {
      if (seen.has(line)) {
        return false;
      }
      seen.add(line);
      return true;
    });
  } else if (options.mode === 'consecutive') {
    // Remove only consecutive duplicates
    processedLines = lines.filter((line, index, arr) => {
      return index === 0 || line !== arr[index - 1];
    });
  } else if (options.mode === 'unique') {
    // Leave only absolutely unique lines
    const lineCount = new Map<string, number>();
    lines.forEach((line) => {
      lineCount.set(line, (lineCount.get(line) || 0) + 1);
    });

    processedLines = lines.filter((line) => lineCount.get(line) === 1);
  }

  // Sort lines if option is selected
  if (options.sortLines) {
    processedLines.sort();
  }

  // Process newlines for output
  if (options.newlines === 'filter') {
    // Process newlines as regular lines (already done by default)
  } else if (options.newlines === 'preserve') {
    // Make sure empty lines are preserved in the output
    processedLines = text.split('\n').map((line) => {
      if (line.trim() === '') return line;
      return processedLines.includes(line) ? line : '';
    });
  }

  return processedLines.join('\n');
}

// Example usage:
// const result = removeDuplicateLines(inputText, {
//   mode: 'all',
//   newlines: 'filter',
//   sortLines: false,
//   trimTextLines: true
// });
