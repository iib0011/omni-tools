import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  path: 'resize',
  icon: 'material-symbols:resize',
  keywords: [
    'resize',
    'video',
    'scale',
    'resolution',
    'dimensions',
    'width',
    'height',
    '240p',
    '360p',
    '480p',
    '720p',
    '1080p',
    'mp4',
    'video editing'
  ],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'video:resize.title',
    description: 'video:resize.description',
    shortDescription: 'video:resize.shortDescription',
    userTypes: ['generalUsers']
  }
});
