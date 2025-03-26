import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('json', {
  name: 'Convert JSON to XML',
  path: 'json-to-xml',
  icon: 'mdi-light:xml',
  description: 'Convert JSON files to XML format with customizable options.',
  shortDescription: 'Convert JSON data to XML format',
  keywords: ['json', 'xml', 'convert', 'transform', 'parse'],
  component: lazy(() => import('./index'))
});
