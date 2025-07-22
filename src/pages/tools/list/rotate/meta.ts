import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  path: 'rotate',
  icon: 'material-symbols-light:rotate-right',

  keywords: ['rotate'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'list:rotate.title',
    description: 'list:rotate.description',
    shortDescription: 'list:rotate.shortDescription',
    userTypes: ['General Users']
  }
});
