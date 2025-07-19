import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('audio', {
  i18n: {
    name: 'audio:AACMP3.title',
    description: 'audio:AACMP3.description',
    shortDescription: 'audio:AACMP3.shortDescription',
    longDescription: 'audio:AACMP3.longDescription'
  },
  path: 'AAC-MP3',
  icon: 'bi:filetype-mp3',
  keywords: ['AAC', 'MP3', 'convert', 'audio', 'file conversion'],
  component: lazy(() => import('./index'))
});
