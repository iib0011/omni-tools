import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('audio', {
  name: 'Change audio speed',
  path: 'change-speed',
  icon: 'material-symbols:speed',
  description:
    'Change the playback speed of audio files. Speed up or slow down audio while maintaining pitch.',
  shortDescription: 'Change the speed of audio files',
  keywords: [
    'audio',
    'speed',
    'tempo',
    'playback',
    'accelerate',
    'slow down',
    'pitch',
    'media'
  ],
  longDescription:
    'This tool allows you to change the playback speed of audio files. You can speed up or slow down audio while maintaining the original pitch. Useful for podcasts, music, or any audio content where you want to adjust the playback speed.',
  component: lazy(() => import('./index')),
  i18n: {
    name: 'audio:changeSpeed.title',
    description: 'audio:changeSpeed.description',
    shortDescription: 'audio:changeSpeed.shortDescription'
  }
});
