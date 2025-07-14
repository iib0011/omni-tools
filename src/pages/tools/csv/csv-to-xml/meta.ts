import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('csv', {
  i18n: {
    name: 'csv:csvToXml.title',
    description: 'csv:csvToXml.description',
    shortDescription: 'csv:csvToXml.shortDescription'
  },
  name: 'Convert CSV to XML',
  path: 'csv-to-xml',
  icon: 'mdi-light:xml',
  description: 'Convert CSV files to XML format with customizable options.',
  shortDescription: 'Convert CSV data to XML format.',
  keywords: ['csv', 'xml', 'convert', 'transform', 'parse'],
  component: lazy(() => import('./index'))
});
