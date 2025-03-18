import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('csv', {
  name: 'Convert CSV to XML',
  path: 'csv-to-xml',
  icon: 'lets-icons:xml-light',
  description: 'Convert CSV files to XML format with customizable options.',
  shortDescription: 'Convert CSV data to XML format',
  keywords: ['csv', 'xml', 'convert', 'transform', 'parse'],
  component: lazy(() => import('./index'))
});
