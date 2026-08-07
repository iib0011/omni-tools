import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('audio', {
  path: 'loop',
  icon: 'icon-park-solid:replay-music',

  keywords: ['audio', 'loop', 'repeat', 'continuous'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'audio:loop.title',
    description: 'audio:loop.description',
    shortDescription: 'audio:loop.shortDescription',
    userTypes: ['generalUsers']
  }
});
