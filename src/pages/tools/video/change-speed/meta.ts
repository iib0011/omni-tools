import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  name: 'Change Video Speed',
  path: 'change-speed',
  icon: 'material-symbols:speed',
  description:
    'Change the playback speed of video files. Speed up or slow down videos while maintaining audio synchronization. Supports various speed multipliers and common video formats.',
  shortDescription: 'Change video playback speed',
  keywords: ['video', 'speed', 'playback', 'fast', 'slow'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'video:changeSpeed.title',
    description: 'video:changeSpeed.description',
    shortDescription: 'video:changeSpeed.shortDescription'
  }
});
