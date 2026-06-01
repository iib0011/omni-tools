type JsonToXmlOptions = {
  indentationType: 'space' | 'tab' | 'none';
  addMetaTag: boolean;
};

export const convertJsonToXml = (
  json: string,
  options: JsonToXmlOptions
): string => {
  const obj = JSON.parse(json);
  return convertObjectToXml(obj, options);
};

const getIndentation = (options: JsonToXmlOptions, depth: number): string => {
  switch (options.indentationType) {
    case 'space':
      return '  '.repeat(depth + 1);
    case 'tab':
      return '\t'.repeat(depth + 1);
    case 'none':
    default:
      return '';
  }
};

const MAX_DEPTH = 100;

const sanitizeXmlTagName = (key: string): string => {
  // Prefix numeric-start keys so they become valid XML names
  let tag = /^[0-9]/.test(key) ? `_${key}` : key;
  // Replace any character that is not a letter, digit, underscore, or hyphen
  tag = tag.replace(/[^a-zA-Z0-9_-]/g, '_');
  return tag || '_';
};

const convertObjectToXml = (
  obj: any,
  options: JsonToXmlOptions,
  depth: number = 0
): string => {
  if (depth >= MAX_DEPTH) {
    throw new Error(
      `JSON nesting exceeds maximum depth of ${MAX_DEPTH} levels`
    );
  }

  let xml = '';

  const newline = options.indentationType === 'none' ? '' : '\n';

  if (depth === 0) {
    if (options.addMetaTag) {
      xml += '<?xml version="1.0" encoding="UTF-8"?>' + newline;
    }
    xml += '<root>' + newline;
  }

  for (const key in obj) {
    const value = obj[key];
    const keyString = sanitizeXmlTagName(
      isNaN(Number(key)) ? key : `row-${key}`
    );

    // Handle null values
    if (value === null) {
      xml += `${getIndentation(
        options,
        depth
      )}<${keyString}></${keyString}>${newline}`;
      continue;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      value.forEach((item) => {
        xml += `${getIndentation(options, depth)}<${keyString}>`;
        if (item === null) {
          xml += `</${keyString}>${newline}`;
        } else if (typeof item === 'object') {
          xml += `${newline}${convertObjectToXml(
            item,
            options,
            depth + 1
          )}${getIndentation(options, depth)}`;
          xml += `</${keyString}>${newline}`;
        } else {
          xml += `${escapeXml(String(item))}</${keyString}>${newline}`;
        }
      });
      continue;
    }

    // Handle objects
    if (typeof value === 'object') {
      xml += `${getIndentation(options, depth)}<${keyString}>${newline}`;
      xml += convertObjectToXml(value, options, depth + 1);
      xml += `${getIndentation(options, depth)}</${keyString}>${newline}`;
      continue;
    }

    // Handle primitive values (string, number, boolean, etc.)
    xml += `${getIndentation(options, depth)}<${keyString}>${escapeXml(
      String(value)
    )}</${keyString}>${newline}`;
  }

  return depth === 0 ? `${xml}</root>` : xml;
};

const escapeXml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};
