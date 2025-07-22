import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  path: 'compress',
  icon: 'icon-park-outline:compression',

  keywords: [
    'compress',
    'video',
    'reduce',
    'size',
    'optimize',
    'mp4',
    'mov',
    'avi',
    'video editing',
    'shrink'
  ],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'video:compress.title',
    description: 'video:compress.description',
    shortDescription: 'video:compress.shortDescription',
    userTypes: ['General Users', 'Developers']
  }
});
