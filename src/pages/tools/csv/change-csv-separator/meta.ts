import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('csv', {
  name: 'Change CSV Separator',
  path: 'change-csv-separator',
  icon: 'material-symbols:code',
  description:
    'Change the delimiter/separator in CSV files. Convert between different CSV formats like comma, semicolon, tab, or custom separators.',
  shortDescription: 'Change CSV file delimiter',
  keywords: ['csv', 'separator', 'delimiter', 'change'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'csv.changeCsvSeparator.name',
    description: 'csv.changeCsvSeparator.description',
    shortDescription: 'csv.changeCsvSeparator.shortDescription'
  }
});
