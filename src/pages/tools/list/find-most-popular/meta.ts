import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  path: 'find-most-popular',
  icon: 'material-symbols-light:trending-up',

  keywords: ['find', 'most', 'popular'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'list:findMostPopular.title',
    description: 'list:findMostPopular.description',
    shortDescription: 'list:findMostPopular.shortDescription',
    userTypes: ['General Users', 'Developers']
  }
});
