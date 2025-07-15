const fixTrailingCommas = (json: string): string => {
  // Replace trailing commas in objects and arrays with proper JSON syntax
  return json
    .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas in objects and arrays
    .replace(/,\s*\n\s*([}\]])/g, '\n$1'); // Also handle when the closing bracket is on a new line
};

const tryParseJSON = (
  json: string
): { valid: boolean; data?: any; error?: string } => {
  if (!json.trim()) {
    return { valid: true, data: {} };
  }

  try {
    // Try to parse after fixing trailing commas
    const fixedJson = fixTrailingCommas(json);
    const data = JSON.parse(fixedJson);
    return { valid: true, data };
  } catch (error) {
    const errorMessage =
      error instanceof SyntaxError ? error.message : 'Invalid JSON format';
    // Extract line and column info from the error message if available
    const match = errorMessage.match(/at line (\d+) column (\d+)/);
    if (match) {
      const [, line, column] = match;
      return {
        valid: false,
        error: `${errorMessage}\nLocation: Line ${line}, Column ${column}`
      };
    }
    return {
      valid: false,
      error: errorMessage
    };
  }
};

export const compareJson = (
  json1: string,
  json2: string,
  format: 'text' | 'json'
): string => {
  // Handle empty inputs
  if (!json1.trim() && !json2.trim()) return '';

  // Parse both JSON inputs
  const parsed1 = tryParseJSON(json1);
  const parsed2 = tryParseJSON(json2);

  // Handle parsing errors
  if (!parsed1.valid || !parsed2.valid) {
    const errors = [];
    if (!parsed1.valid) {
      errors.push(`First JSON: ${parsed1.error}`);
    }
    if (!parsed2.valid) {
      errors.push(`Second JSON: ${parsed2.error}`);
    }
    throw new Error(errors.join('\n\n'));
  }

  // Compare the valid JSON objects
  if (format === 'json') {
    const diffs = findDifferencesJSON(parsed1.data, parsed2.data);
    return JSON.stringify(diffs);
  } else {
    const differences = findDifferencesText(parsed1.data, parsed2.data);
    if (differences.length === 0) {
      return 'No differences found';
    }
    return differences.join('\n');
  }
};

const findDifferencesText = (
  obj1: any,
  obj2: any,
  path: string[] = []
): string[] => {
  const differences: string[] = [];
  const processPath = (p: string[]): string =>
    p.length ? p.join('.') : 'root';

  // Compare all keys in obj1
  for (const key in obj1) {
    const currentPath = [...path, key];

    if (!(key in obj2)) {
      differences.push(`${processPath(currentPath)}: Missing in second JSON`);
      continue;
    }

    const value1 = obj1[key];
    const value2 = obj2[key];

    if (
      typeof value1 === 'object' &&
      value1 !== null &&
      typeof value2 === 'object' &&
      value2 !== null
    ) {
      differences.push(...findDifferencesText(value1, value2, currentPath));
    } else if (value1 !== value2) {
      differences.push(
        `${processPath(currentPath)}: Mismatch: ${value1} != ${value2}`
      );
    }
  }

  // Check for keys in obj2 that don't exist in obj1
  for (const key in obj2) {
    if (!(key in obj1)) {
      const currentPath = [...path, key];
      differences.push(`${processPath(currentPath)}: Missing in first JSON`);
    }
  }

  return differences;
};

const findDifferencesJSON = (obj1: any, obj2: any): Record<string, string> => {
  const result: Record<string, string> = {};

  // Compare all properties
  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

  for (const key of allKeys) {
    if (!(key in obj1)) {
      result[key] = 'Missing in first JSON';
    } else if (!(key in obj2)) {
      result[key] = 'Missing in second JSON';
    } else if (obj1[key] !== obj2[key]) {
      result[key] = `Mismatch: ${obj1[key]} != ${obj2[key]}`;
    }
  }

  return result;
};

const findDifferences = (
  obj1: any,
  obj2: any,
  path: string[] = []
): string[] => {
  const differences: string[] = [];

  // Helper to format values for display
  const formatValue = (value: any): string => {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (typeof value === 'string') return `"${value}"`;
    return String(value);
  };

  // Helper to get type description
  const getTypeDescription = (value: any): string => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  };

  const processPath = (p: string[]): string =>
    p.length ? p.join('.') : 'root';

  // Compare all keys in obj1
  for (const key in obj1) {
    const currentPath = [...path, key];

    if (!(key in obj2)) {
      differences.push(
        `Property ${processPath(
          currentPath
        )} exists only in first JSON:\n  ${formatValue(obj1[key])}`
      );
      continue;
    }

    const value1 = obj1[key];
    const value2 = obj2[key];
    const type1 = getTypeDescription(value1);
    const type2 = getTypeDescription(value2);

    if (type1 !== type2) {
      differences.push(
        `Type mismatch at ${processPath(
          currentPath
        )}:\n  First: ${type1} (${formatValue(
          value1
        )})\n  Second: ${type2} (${formatValue(value2)})`
      );
      continue;
    }

    if (type1 === 'object' || type1 === 'array') {
      const childDiffs = findDifferences(value1, value2, currentPath);
      differences.push(...childDiffs);
    } else if (value1 !== value2) {
      differences.push(
        `Value mismatch at ${processPath(currentPath)}:\n  First: ${formatValue(
          value1
        )}\n  Second: ${formatValue(value2)}`
      );
    }
  }

  // Check for keys in obj2 that don't exist in obj1
  for (const key in obj2) {
    if (!(key in obj1)) {
      const currentPath = [...path, key];
      differences.push(
        `Property ${processPath(
          currentPath
        )} exists only in second JSON:\n  ${formatValue(obj2[key])}`
      );
    }
  }

  return differences;
};
