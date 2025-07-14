import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('list', {
  path: 'truncate',
  icon: 'material-symbols-light:content-cut',

  keywords: ['truncate'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'list:truncate.title',
    description: 'list:truncate.description',
    shortDescription: 'list:truncate.shortDescription'
  }
});
