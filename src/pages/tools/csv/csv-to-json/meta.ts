import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('csv', {
  name: 'Convert CSV to JSON',
  path: 'csv-to-json',
  icon: 'lets-icons:json-light',
  description:
    'Convert CSV files to JSON format with customizable options for delimiters, quotes, and output formatting. Support for headers, comments, and dynamic type conversion.',
  shortDescription: 'Convert CSV data to JSON format',
  keywords: ['csv', 'json', 'convert', 'transform', 'parse'],
  component: lazy(() => import('./index'))
});
