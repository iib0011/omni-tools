import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('csv', {
  i18n: {
    name: 'csv:csvToTsv.title',
    description: 'csv:csvToTsv.description',
    shortDescription: 'csv:csvToTsv.shortDescription',
    longDescription: 'csv:csvToTsv.longDescription'
  },

  path: 'csv-to-tsv',
  icon: 'codicon:keyboard-tab',
  keywords: ['csv', 'tsv', 'convert', 'transform', 'parse'],
  component: lazy(() => import('./index'))
});
