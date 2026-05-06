import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('converters', {
  i18n: {
    name: 'converters:audioConverter.title',
    description: 'converters:audioConverter.description',
    shortDescription: 'converters:audioConverter.shortDescription',
    longDescription: 'converters:audioConverter.longDescription'
  },
  path: 'audio-converter',
  icon: 'mdi:music-note-outline',
  keywords: ['audio', 'converter'],
  component: lazy(() => import('./index'))
});
