import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  i18n: {
    name: 'string:translator.title',
    description: 'string:translator.description',
    shortDescription: 'string:translator.shortDescription',
    longDescription: 'string:translator.longDescription',
    userTypes: ['generalUsers', 'developers']
  },
  path: 'translator',
  icon: 'material-symbols:translate',
  keywords: [
    'translator',
    'translate',
    'translation',
    'language',
    'document',
    'docx',
    'srt',
    'subtitles'
  ],
  component: lazy(() => import('./index'))
});
