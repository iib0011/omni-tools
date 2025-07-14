import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('csv', {
  i18n: {
    name: 'csv:insertCsvColumns.title',
    description: 'csv:insertCsvColumns.description',
    shortDescription: 'csv:insertCsvColumns.shortDescription'
  },
  name: 'Insert CSV columns',
  path: 'insert-csv-columns',
  icon: 'hugeicons:column-insert',
  description:
    'Just upload your CSV file in the form below, paste the new column in the options, and it will automatically get inserted in your CSV. In the tool options, you can also specify more than one column to insert, set the insertion position, and optionally skip the empty and comment lines.',
  shortDescription:
    'Quickly insert one or more new columns anywhere in a CSV file.',
  keywords: ['insert', 'csv', 'columns', 'append', 'prepend'],
  longDescription: '',
  component: lazy(() => import('./index'))
});
