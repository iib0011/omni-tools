import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('json', {
  name: 'Convert JSON to XML',
  path: 'json-to-xml',
  icon: 'mdi-light:xml',
  description:
    'Convert JSON data structures to XML format with customizable options for element naming, attributes, and output formatting.',
  shortDescription: 'Convert JSON data to XML format.',
  keywords: ['json', 'xml', 'convert', 'transform', 'parse'],
  userTypes: ['Developers'],
  component: lazy(() => import('./index'))
});
