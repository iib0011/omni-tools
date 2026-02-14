import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  i18n: {
    name: 'image:memeCreator.title',
    description: 'image:memeCreator.description',
    shortDescription: 'image:memeCreator.shortDescription'
  },

  path: 'meme-creator',
  icon: 'mdi:image-text',
  keywords: [
    'meme',
    'meme creator',
    'meme generator',
    'text overlay',
    'image text',
    'add text to image',
    'caption',
    'funny'
  ],
  component: lazy(() => import('./index'))
});
