import { ParsedTSV, TSVParseOptions } from './types';

/**
 * Validates and escapes a delimiter character for safe regex use
 * @param char - The delimiter character to validate and escape
 * @returns The escaped delimiter character
 * @throws Error if the delimiter is invalid
 */
function validateAndEscapeDelimiter(char: string): string {
  // Validate input - only allow single characters
  if (!char || char.length !== 1) {
    throw new Error('Delimiter must be a single character');
  }
  
  // Escape special regex characters to prevent ReDoS
  return char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function parseTSV
  const { 
    delimiter = '\t', 
    hasHeader = true, 
    skipEmptyLines = true 
  } = options;

  if (!content || content.trim().length === 0) {
    return {
      headers: [],
      rows: [],
      totalRows: 0
    };
  }

  try {
    // Validate and escape the delimiter to prevent ReDoS attacks
    const escapedDelimiter = validateAndEscapeDelimiter(delimiter);
    const delimiterRegex = new RegExp(escapedDelimiter, 'g');

    const lines = content.split(/\r?\n/);
    const filteredLines = skipEmptyLines 
      ? lines.filter(line => line.trim().length > 0)
      : lines;

    if (filteredLines.length === 0) {
      return {
        headers: [],
        rows: [],
        totalRows: 0
      };
    }

    let headers: string[] = [];
    let dataLines = filteredLines;

    if (hasHeader && filteredLines.length > 0) {
      headers = filteredLines[0].split(delimiterRegex);
      dataLines = filteredLines.slice(1);
    }

    const rows = dataLines.map((line, index) => {
      const values = line.split(delimiterRegex);
      
      if (hasHeader && headers.length > 0) {
        const rowObject: Record<string, string> = {};
        headers.forEach((header, i) => {
          rowObject[header.trim()] = values[i]?.trim() || '';
        });
        return rowObject;
      } else {
        return values.map(value => value.trim());
      }
    });

    return {
      headers: headers.map(h => h.trim()),
      rows,
      totalRows: rows.length
    };

  } catch (error) {
    throw new Error(`Failed to parse TSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Converts TSV content to JSON format
 * @param content - The TSV content to convert
 * @param options - Conversion options
 * @returns JSON string representation of the TSV data
 */
export function convertTSVToJSON(content: string, options: TSVParseOptions = {}): string {
  try {
    const parsed = parseTSV(content, options);
    return JSON.stringify(parsed.rows, null, 2);
  } catch (error) {
    throw new Error(`Failed to convert TSV to JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
