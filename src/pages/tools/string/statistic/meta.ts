import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  path: 'statistics',

  icon: 'fluent:document-landscape-data-24-filled',

  keywords: ['text', 'statistics', 'count', 'lines', 'words', 'characters'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:statistic.title',
    description: 'string:statistic.description',
    shortDescription: 'string:statistic.shortDescription',
    userTypes: ['General Users', 'Students', 'Developers']
  }
});
