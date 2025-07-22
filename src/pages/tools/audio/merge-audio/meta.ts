import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('audio', {
  i18n: {
    name: 'audio:mergeAudio.title',
    description: 'audio:mergeAudio.description',
    shortDescription: 'audio:mergeAudio.shortDescription',
    longDescription: 'audio:mergeAudio.longDescription',
    userTypes: ['generalUsers', 'developers']
  },

  path: 'merge-audio',
  icon: 'fluent:merge-20-regular',

  keywords: [
    'merge',
    'audio',
    'combine',
    'concatenate',
    'join',
    'mp3',
    'aac',
    'wav',
    'audio editing',
    'multiple files'
  ],
  component: lazy(() => import('./index'))
});
