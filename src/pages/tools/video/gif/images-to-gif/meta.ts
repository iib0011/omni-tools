import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('gif', {
  path: 'images-to-gif',
  icon: 'material-symbols-light:gif-rounded',
  keywords: ['gif', 'images', 'animate', 'frames', 'convert', 'animation'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'video:gif.imagesToGif.title',
    description: 'video:gif.imagesToGif.description',
    shortDescription: 'video:gif.imagesToGif.shortDescription',
    userTypes: ['generalUsers']
  }
});
