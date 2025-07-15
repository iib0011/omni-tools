import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  i18n: {
    name: 'string:rot13.title',
    description: 'string:rot13.description',
    shortDescription: 'string:rot13.shortDescription'
  },

  path: 'rot13',
  icon: 'hugeicons:encrypt',

  keywords: ['rot13'],
  component: lazy(() => import('./index'))
});
