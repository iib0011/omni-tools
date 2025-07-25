import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('converters', {
  i18n: {
    name: 'translation:converters.audioconverter.title',
    description: 'translation:converters.audioconverter.description',
    shortDescription: 'translation:converters.audioconverter.shortDescription',
    longDescription: 'translation:converters.audioconverter.longDescription'
  },
  path: 'audio-converter',
  icon: 'mdi:music-note-outline',
  keywords: ['audio', 'converter'],
  component: lazy(() => import('./index'))
});
