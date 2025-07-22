import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('csv', {
  i18n: {
    name: 'csv:csvRowsToColumns.title',
    description: 'csv:csvRowsToColumns.description',
    shortDescription: 'csv:csvRowsToColumns.shortDescription',
    longDescription: 'csv:csvRowsToColumns.longDescription',
    userTypes: ['General Users', 'Developers']
  },
  path: 'csv-rows-to-columns',
  icon: 'fluent:text-arrow-down-right-column-24-filled',
  keywords: ['csv', 'rows', 'columns', 'transpose'],
  component: lazy(() => import('./index'))
});
