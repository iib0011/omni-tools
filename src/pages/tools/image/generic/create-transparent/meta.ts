import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  i18n: {
    name: 'image:createTransparent.title',
    description: 'image:createTransparent.description',
    shortDescription: 'image:createTransparent.shortDescription'
  },
  name: 'Create transparent PNG',
  path: 'create-transparent',
  icon: 'mdi:circle-transparent',
  shortDescription: 'Quickly make an image transparent',
  description:
    "World's simplest online Portable Network Graphics transparency maker. Just import your image in the editor on the left and you will instantly get a transparent PNG on the right. Free, quick, and very powerful. Import an image – get a transparent PNG.",
  keywords: ['create', 'transparent'],
  component: lazy(() => import('./index'))
});
