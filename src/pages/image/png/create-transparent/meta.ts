import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('png', {
  name: 'Create transparent PNG',
  path: 'create-transparent',
  // image,
  description:
    "World's simplest online Portable Network Graphics transparency maker. Just import your PNG image in the editor on the left and you will instantly get a transparent PNG on the right. Free, quick, and very powerful. Import a PNG – get a transparent PNG.",
  keywords: ['create', 'transparent'],
  component: lazy(() => import('./index'))
});
