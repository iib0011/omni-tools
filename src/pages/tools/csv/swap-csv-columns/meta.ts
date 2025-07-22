import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('csv', {
  i18n: {
    name: 'csv:swapCsvColumns.title',
    description: 'csv:swapCsvColumns.description',
    shortDescription: 'csv:swapCsvColumns.shortDescription',
    longDescription: 'csv:swapCsvColumns.longDescription',
    userTypes: ['General Users', 'Developers']
  },

  path: 'swap-csv-columns',
  icon: 'eva:swap-outline',
  keywords: ['csv', 'swap', 'columns'],
  component: lazy(() => import('./index'))
});
