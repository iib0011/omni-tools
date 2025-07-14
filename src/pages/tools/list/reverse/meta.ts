import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  path: 'reverse',
  icon: 'proicons:reverse',

  keywords: ['reverse'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'list:reverse.title',
    description: 'list:reverse.description',
    shortDescription: 'list:reverse.shortDescription'
  }
});
