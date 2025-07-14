import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  path: 'sort',
  icon: 'material-symbols-light:sort',

  keywords: ['sort'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'list:sort.title',
    description: 'list:sort.description',
    shortDescription: 'list:sort.shortDescription'
  }
});
