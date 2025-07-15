import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('audio', {
  i18n: {
    name: 'audio:trim.title',
    description: 'audio:trim.description',
    shortDescription: 'audio:trim.shortDescription',
    longDescription: 'audio:trim.longDescription'
  },

  path: 'trim',
  icon: 'mdi:scissors-cutting',

  keywords: [
    'trim',
    'audio',
    'cut',
    'segment',
    'extract',
    'mp3',
    'aac',
    'wav',
    'audio editing',
    'time'
  ],

  component: lazy(() => import('./index'))
});
