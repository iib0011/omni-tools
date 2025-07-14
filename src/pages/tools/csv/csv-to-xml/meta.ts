import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('csv', {
  i18n: {
    name: 'csv:csvToXml.title',
    description: 'csv:csvToXml.description',
    shortDescription: 'csv:csvToXml.shortDescription'
  },

  path: 'csv-to-xml',
  icon: 'mdi-light:xml',

  keywords: ['csv', 'xml', 'convert', 'transform', 'parse'],
  component: lazy(() => import('./index'))
});
