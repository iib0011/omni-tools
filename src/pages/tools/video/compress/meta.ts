import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  name: 'Compress Video',
  path: 'compress',
  icon: 'icon-park-outline:compression',
  description:
    'Compress videos by scaling them to different resolutions like 240p, 480p, 720p, etc. This tool helps reduce file size while maintaining acceptable quality. Supports common video formats like MP4, WebM, and OGG.',
  shortDescription: 'Compress videos by scaling to different resolutions',
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
