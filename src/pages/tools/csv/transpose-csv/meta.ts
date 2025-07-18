import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('csv', {
  i18n: {
    name: 'csv:transposeCsv.title',
    description: 'csv:transposeCsv.description',
    shortDescription: 'csv:transposeCsv.shortDescription',
    longDescription: 'csv:transposeCsv.longDescription',
    userTypes: ['Developers']
  },

  path: 'transpose-csv',
  icon: 'carbon:transpose',

  keywords: ['transpose', 'csv'],
  component: lazy(() => import('./index'))
});
