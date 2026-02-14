import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  path: 'meme-generator',
  icon: 'mdi:emoticon-lol-outline',
  keywords: ['meme', 'generator', 'creator', 'image', 'text'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'image:memeGenerator.title',
    description: 'image:memeGenerator.description',
    shortDescription: 'image:memeGenerator.shortDescription',
    userTypes: ['generalUsers']
  }
});
