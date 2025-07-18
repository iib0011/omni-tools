import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('csv', {
  i18n: {
    name: 'csv:insertCsvColumns.title',
    description: 'csv:insertCsvColumns.description',
    shortDescription: 'csv:insertCsvColumns.shortDescription',
    userTypes: ['Developers']
  },

  path: 'insert-csv-columns',
  icon: 'hugeicons:column-insert',

  keywords: ['insert', 'csv', 'columns', 'append', 'prepend'],
  component: lazy(() => import('./index'))
});
