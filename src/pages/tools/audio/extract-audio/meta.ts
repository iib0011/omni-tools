import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('audio', {
  path: 'extract-audio',
  icon: 'mdi:music-note',

  keywords: [
    'extract',
    'audio',
    'video',
    'mp3',
    'aac',
    'wav',
    'audio extraction',
    'media',
    'convert'
  ],

  component: lazy(() => import('./index')),
  i18n: {
    name: 'audio:extractAudio.title',
    description: 'audio:extractAudio.description',
    shortDescription: 'audio:extractAudio.shortDescription',
    userTypes: ['General Users', 'Students', 'Developers']
  }
});
