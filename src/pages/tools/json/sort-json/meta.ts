import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('json', {
  path: 'sort-json',
  icon: 'material-symbols:sort',
  keywords: ['json', 'sort', 'order', 'array', 'key'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'json:sortJson.title',
    description: 'json:sortJson.description',
    shortDescription: 'json:sortJson.shortDescription'
  }
});
