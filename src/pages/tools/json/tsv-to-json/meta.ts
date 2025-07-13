import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('json', {
  name: 'TSV to JSON',
  path: 'tsv-to-json',
  icon: 'material-symbols:code',
  description:
    'Convert TSV (Tab-Separated Values) data to JSON format. Transform tabular data into structured JSON objects.',
  shortDescription: 'Convert TSV to JSON format',
  keywords: ['tsv', 'json', 'convert', 'tabular'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'json.tsvToJson.name',
    description: 'json.tsvToJson.description',
    shortDescription: 'json.tsvToJson.shortDescription'
  }
});
