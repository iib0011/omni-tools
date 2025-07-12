import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('csv', {
  name: 'Convert CSV to XML',
  path: 'csv-to-xml',
  icon: 'mdi-light:xml',
  description: 'Convert CSV files to XML format with customizable options.',
  shortDescription: 'Convert CSV data to XML format.',
  keywords: ['csv', 'xml', 'convert', 'transform', 'parse'],
  userTypes: ['Developers'],
  component: lazy(() => import('./index'))
});
