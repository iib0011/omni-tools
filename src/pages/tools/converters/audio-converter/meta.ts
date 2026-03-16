import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('converters', {
  i18n: {
    name: 'converters:audioconverter.title',
    description: 'converters:audioconverter.description',
    shortDescription: 'converters:audioconverter.shortDescription',
    longDescription: 'converters:audioconverter.longDescription'
  },
  path: 'audio-converter',
  icon: 'mdi:music-note-outline',
  keywords: ['audio', 'converter'],
  component: lazy(() => import('./index'))
});
