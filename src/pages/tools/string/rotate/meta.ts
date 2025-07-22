import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  i18n: {
    name: 'string:rotate.title',
    description: 'string:rotate.description',
    shortDescription: 'string:rotate.shortDescription',
    userTypes: ['General Users', 'Developers']
  },

  path: 'rotate',
  icon: 'carbon:rotate',

  keywords: ['rotate'],
  component: lazy(() => import('./index'))
});
