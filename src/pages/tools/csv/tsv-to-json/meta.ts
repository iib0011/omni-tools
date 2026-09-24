import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('csv', {
  path: 'tsv-to-json',
  icon: 'material-symbols:code',

  keywords: ['tsv', 'json', 'convert', 'tabular'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'csv:tsvToJson.title',
    description: 'csv:tsvToJson.description',
    shortDescription: 'csv:tsvToJson.shortDescription'
  }
});
