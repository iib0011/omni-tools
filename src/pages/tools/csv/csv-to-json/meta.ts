import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('csv', {
  i18n: {
    name: 'csv:csvToJson.title',
    description: 'csv:csvToJson.description',
    shortDescription: 'csv:csvToJson.shortDescription'
  },

  path: 'csv-to-json',
  icon: 'lets-icons:json-light',

  keywords: ['csv', 'json', 'convert', 'transform', 'parse'],
  userTypes: ['Developers'],
  component: lazy(() => import('./index'))
});
