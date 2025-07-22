import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  path: 'crop-video',
  icon: 'material-symbols:crop',
  keywords: [
    'crop',
    'video',
    'trim',
    'aspect ratio',
    'mp4',
    'mov',
    'avi',
    'video editing',
    'resize'
  ],
  i18n: {
    name: 'video:cropVideo.title',
    description: 'video:cropVideo.description',
    shortDescription: 'video:cropVideo.shortDescription',
    userTypes: ['generalUsers']
  },
  component: lazy(() => import('./index'))
});
