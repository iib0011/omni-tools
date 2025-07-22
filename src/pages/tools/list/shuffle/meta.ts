import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  path: 'shuffle',
  icon: 'material-symbols-light:shuffle',

  keywords: ['shuffle'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'list:shuffle.title',
    description: 'list:shuffle.description',
    shortDescription: 'list:shuffle.shortDescription',
    userTypes: ['generalUsers']
  }
});
