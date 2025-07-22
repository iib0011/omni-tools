import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  path: 'duplicate',
  icon: 'material-symbols-light:content-copy',

  keywords: ['duplicate'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'list:duplicate.title',
    description: 'list:duplicate.description',
    shortDescription: 'list:duplicate.shortDescription',
    userTypes: ['generalUsers', 'developers']
  }
});
