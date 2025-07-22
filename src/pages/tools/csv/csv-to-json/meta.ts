import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('csv', {
  i18n: {
    name: 'csv:csvToJson.title',
    description: 'csv:csvToJson.description',
    shortDescription: 'csv:csvToJson.shortDescription',
    userTypes: ['General Users', 'Developers']
  },

  path: 'csv-to-json',
  icon: 'lets-icons:json-light',

  keywords: ['csv', 'json', 'convert', 'transform', 'parse'],
  component: lazy(() => import('./index'))
});
