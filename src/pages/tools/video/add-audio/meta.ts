import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  path: 'add-audio',
  icon: 'tabler:music-plus',

  keywords: [
    'add',
    'audio',
    'video',
    'music',
    'sound',
    'track',
    'replace',
    'mix',
    'mp4',
    'mp3',
    'background music'
  ],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'video:addAudio.title',
    description: 'video:addAudio.description',
    shortDescription: 'video:addAudio.shortDescription',
    userTypes: ['generalUsers']
  }
});
