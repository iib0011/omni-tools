import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('png', {
  i18n: {
    name: 'image:compressPng.title',
    description: 'image:compressPng.description',
    shortDescription: 'image:compressPng.shortDescription'
  },

  path: 'compress-png',
  icon: 'material-symbols-light:compress',

  keywords: ['compress', 'png'],
  component: lazy(() => import('./index'))
});
