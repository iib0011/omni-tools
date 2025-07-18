import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('json', {
  path: 'tsv-to-json',
  icon: 'material-symbols:code',

  keywords: ['tsv', 'json', 'convert', 'tabular'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'json:tsvToJson.title',
    description: 'json:tsvToJson.description',
    shortDescription: 'json:tsvToJson.shortDescription',
    userTypes: ['Developers']
  }
});
