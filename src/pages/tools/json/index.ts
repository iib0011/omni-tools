import { tool as jsonPrettify } from './prettify/meta';
import { tool as jsonMinify } from './minify/meta';
import { tool as jsonStringify } from './stringify/meta';
import { tool as validateJson } from './validateJson/meta';

export const jsonTools = [
  validateJson,
  jsonPrettify,
  jsonMinify,
  jsonStringify
];
