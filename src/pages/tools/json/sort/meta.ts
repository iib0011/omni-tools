import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('json', {
  path: 'sort',
  icon: 'hugeicons:sorting-05',
  keywords: ['json', 'sort', 'order', 'array', 'key'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'json:sortJson.title',
    description: 'json:sortJson.description',
    shortDescription: 'json:sortJson.shortDescription',
    longDescription: 'json:sortJson.longDescription'
  }
});
