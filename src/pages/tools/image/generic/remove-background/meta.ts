import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  i18n: {
    name: 'image:removeBackground.title',
    description: 'image:removeBackground.description',
    shortDescription: 'image:removeBackground.shortDescription'
  },

  path: 'remove-background',
  icon: 'mdi:image-remove',

  keywords: ['png', 'transparent', 'image', 'ai', 'jpg', 'backing', 'backdrop'],
  component: lazy(() => import('./index'))
});
