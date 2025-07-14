import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('csv', {
  path: 'change-csv-separator',
  icon: 'material-symbols:code',

  keywords: ['csv', 'separator', 'delimiter', 'change'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'csv:changeCsvSeparator.title',
    description: 'csv:changeCsvSeparator.description',
    shortDescription: 'csv:changeCsvSeparator.shortDescription'
  }
});
