import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  i18n: {
    name: 'image:createTransparent.title',
    description: 'image:createTransparent.description',
    shortDescription: 'image:createTransparent.shortDescription'
  },

  path: 'create-transparent',
  icon: 'mdi:circle-transparent',

  keywords: ['create', 'transparent'],
  component: lazy(() => import('./index'))
});
