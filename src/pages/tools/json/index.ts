import { tool as jsonPrettify } from './prettify/meta';
import { tool as jsonMinify } from './minify/meta';
import { tool as jsonStringify } from './stringify/meta';
import { tool as validateJson } from './validateJson/meta';
import { tool as jsonToXml } from './json-to-xml/meta';
import { tool as escapeJson } from './escape-json/meta';
import { tool as jsonComparison } from './json-comparison/meta';
import { tool as sortJson } from './sort/meta';
import { tool as jsonToCsv } from './json-to-csv/meta';
import { tool as jsonViewer } from './json-viewer/meta';

export const jsonTools = [
  jsonViewer,
  validateJson,
  jsonPrettify,
  jsonMinify,
  jsonStringify,
  jsonToXml,
  jsonToCsv,
  escapeJson,
  jsonComparison,
  sortJson
];
