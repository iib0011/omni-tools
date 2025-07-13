import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  name: 'Video to GIF',
  path: 'video-to-gif',
  icon: 'material-symbols:gif',
  description:
    'Convert video files to animated GIF format. Extract specific time ranges and create shareable animated images.',
  shortDescription: 'Convert video to animated GIF',
  keywords: ['video', 'gif', 'convert', 'animated', 'image'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'video.videoToGif.name',
    description: 'video.videoToGif.description',
    shortDescription: 'video.videoToGif.shortDescription'
  }
});
