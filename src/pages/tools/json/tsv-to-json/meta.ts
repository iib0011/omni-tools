import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('json', {
  name: 'Convert TSV to JSON',
  path: 'tsv-to-json',
  icon: 'material-symbols:tsv-rounded',
  description:
    'Convert TSV files to JSON format with customizable options for delimiters, quotes, and output formatting. Support for headers, comments, and dynamic type conversion.',
  shortDescription: 'Convert TSV data to JSON format.',
  longDescription:
    'This tool allows you to convert TSV (Tab-Separated Values) files into JSON format. You can customize the conversion process by specifying delimiters, quote characters, and whether to use headers. It also supports dynamic type conversion for values, handling comments, and skipping empty lines. The output can be formatted with indentation or minified as needed.',
  keywords: ['tsv', 'json', 'convert', 'transform', 'parse'],
  userTypes: ['Developers'],
  component: lazy(() => import('./index'))
});
