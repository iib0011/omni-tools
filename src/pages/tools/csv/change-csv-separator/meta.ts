import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('csv', {
  name: 'Change CSV separator',
  path: 'change-csv-separator',
  icon: 'material-symbols:split-scene-rounded',
  description:
    'Just upload your CSV file in the form below and it will automatically get a new column delimiter character. In the tool options, you can specify which delimiter and quote characters are used in the source CSV file and customize the desired delimiter and quote characters for the output CSV. You can also filter the input CSV before the conversion process and skip blank lines and comment lines.',
  shortDescription: 'Quickly change the CSV column delimiter to a new symbol.',
  keywords: ['change', 'csv', 'separator'],
  userTypes: ['Developers'],
  component: lazy(() => import('./index'))
});
