import { InitialValuesType } from './types';

type JsonObject = Record<string, any>;

const MAX_JSON_DEPTH = 100;

export const convertJsonToXml = (
  json: string,
  options: InitialValuesType
): string => {
  const parsed = JSON.parse(json);

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('JSON root value must be an object or array.');
  }

  const chunks: string[] = [];
  const newline = options.indentationType === 'none' ? '' : '\n';

  if (options.addMetaTag) {
    chunks.push(`<?xml version="1.0" encoding="UTF-8"?>${newline}`);
  }

  chunks.push(`<root>${newline}`);

  if (Array.isArray(parsed)) {
    parsed.forEach((item) => {
      chunks.push(convertArrayItemToXml(item, options, 1));
    });
  } else {
    chunks.push(convertObjectToXml(parsed, options, 1));
  }

  chunks.push('</root>');

  return chunks.join('');
};

const convertArrayItemToXml = (
  item: any,
  options: InitialValuesType,
  depth: number
): string => {
  const indentation = getIndentation(options, depth);
  const newline = options.indentationType === 'none' ? '' : '\n';

  if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
    return `${indentation}<item>${newline}${convertObjectToXml(
      item,
      options,
      depth + 1
    )}${indentation}</item>${newline}`;
  }

  return `${indentation}<item>${escapeXml(String(item))}</item>${newline}`;
};

const convertObjectToXml = (
  obj: JsonObject,
  options: InitialValuesType,
  depth: number
): string => {
  if (depth > MAX_JSON_DEPTH) {
    throw new Error(`JSON nesting exceeds maximum depth of ${MAX_JSON_DEPTH}.`);
  }

  const chunks: string[] = [];
  const newline = options.indentationType === 'none' ? '' : '\n';

  for (const [key, value] of Object.entries(obj)) {
    const tagName = normalizeXmlTagName(key);
    const indentation = getIndentation(options, depth);

    if (value === null) {
      chunks.push(`${indentation}<${tagName}></${tagName}>${newline}`);
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        chunks.push(`${indentation}<${tagName}>`);

        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          chunks.push(newline);
          chunks.push(convertObjectToXml(item, options, depth + 1));
          chunks.push(indentation);
        } else {
          chunks.push(escapeXml(String(item)));
        }

        chunks.push(`</${tagName}>${newline}`);
      });

      continue;
    }

    if (typeof value === 'object') {
      chunks.push(`${indentation}<${tagName}>${newline}`);

      chunks.push(convertObjectToXml(value, options, depth + 1));

      chunks.push(`${indentation}</${tagName}>${newline}`);

      continue;
    }

    chunks.push(
      `${indentation}<${tagName}>${escapeXml(
        String(value)
      )}</${tagName}>${newline}`
    );
  }

  return chunks.join('');
};

const getIndentation = (options: InitialValuesType, depth: number): string => {
  switch (options.indentationType) {
    case 'space':
      return '  '.repeat(depth);
    case 'tab':
      return '\t'.repeat(depth);
    default:
      return '';
  }
};

const escapeXml = (value: string): string => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

const normalizeXmlTagName = (key: string): string => {
  const tagName = key !== '' && !isNaN(Number(key)) ? `row-${key}` : key;

  const sanitized = tagName.replace(/[^a-zA-Z0-9_.-]/g, '_');

  return /^[a-zA-Z_]/.test(sanitized) ? sanitized : `_${sanitized}`;
};
