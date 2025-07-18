import { tool as jsonPrettify } from './prettify/meta';
import { tool as jsonMinify } from './minify/meta';
import { tool as jsonStringify } from './stringify/meta';
import { tool as validateJson } from './validateJson/meta';
import { tool as jsonToXml } from './json-to-xml/meta';
import { tool as escapeJson } from './escape-json/meta';
import { tool as tsvToJson } from './tsv-to-json/meta';
import { tool as jsonComparison } from './json-comparison/meta';

export const jsonTools = [
  validateJson,
  jsonPrettify,
  jsonMinify,
  jsonStringify,
  jsonToXml,
  escapeJson,
  tsvToJson,
  jsonComparison
];
