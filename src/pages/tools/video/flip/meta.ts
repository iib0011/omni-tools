import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  name: 'Flip Video',
  path: 'flip',
  icon: 'material-symbols:flip',
  description:
    'Flip video files horizontally or vertically. Mirror videos for special effects or correct orientation issues.',
  shortDescription: 'Flip video horizontally or vertically',
  keywords: ['video', 'flip', 'mirror', 'horizontal', 'vertical'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'video.flip.name',
    description: 'video.flip.description',
    shortDescription: 'video.flip.shortDescription'
  }
});
