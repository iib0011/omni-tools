import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  i18n: {
    name: 'image:changeColors.title',
    description: 'image:changeColors.description',
    shortDescription: 'image:changeColors.shortDescription'
  },

  path: 'change-colors',
  icon: 'cil:color-fill',

  keywords: ['png', 'jpg', 'replace', 'swap'],
  component: lazy(() => import('./index'))
});
