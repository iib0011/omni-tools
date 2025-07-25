import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  path: 'wrap',
  icon: 'material-symbols-light:wrap-text',

  keywords: ['wrap'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'list:wrap.title',
    description: 'list:wrap.description',
    shortDescription: 'list:wrap.shortDescription',
    userTypes: ['generalUsers', 'developers']
  }
});
