import { InitialValuesType } from './types';
import { escapeMarkup } from '@utils/string';
import { normalizeXmlTagName } from '@utils/xml';
import { parseJsonInput, JsonFormat } from '@utils/json';

type JsonObject = Record<string, any>;

const MAX_JSON_DEPTH = 100;

export const convertJsonToXml = (
  json: string,
  options: InitialValuesType
): { result: string; inputFormat: JsonFormat } => {
  const { data: parsed, format: inputFormat } = parseJsonInput(json);

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

  return { result: chunks.join(''), inputFormat: inputFormat };
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

  return `${indentation}<item>${escapeMarkup(String(item))}</item>${newline}`;
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
          chunks.push(escapeMarkup(String(item)));
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
      `${indentation}<${tagName}>${escapeMarkup(
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
