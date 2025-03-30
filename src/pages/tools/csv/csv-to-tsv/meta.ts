import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('csv', {
  name: 'Convert CSV to TSV',
  path: 'csv-to-tsv',
  icon: 'codicon:keyboard-tab',
  description:
    'Upload your CSV file in the form below and it will automatically get converted to a TSV file. In the tool options, you can customize the input CSV format – specify the field delimiter, quotation character, and comment symbol, as well as skip empty CSV lines, and choose whether to preserve CSV column headers.',
  shortDescription: 'Convert CSV data to TSV format',
  keywords: ['csv', 'tsv', 'convert', 'transform', 'parse'],
  component: lazy(() => import('./index'))
});
