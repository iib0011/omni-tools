import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  path: 'compress',
  icon: 'icon-park-outline:compression',

  keywords: [
    'compress',
    'video',
    'resize',
    'scale',
    'resolution',
    'reduce size'
  ],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'video:compress.title',
    description: 'video:compress.description',
    shortDescription: 'video:compress.shortDescription'
  }
});
