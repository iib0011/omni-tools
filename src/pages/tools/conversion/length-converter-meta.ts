import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('conversion', {
  path: 'length-converter',
  icon: 'mdi:ruler',
  keywords: [
    'length',
    'distance',
    'convert',
    'meter',
    'mile',
    'yard',
    'foot',
    'inch'
  ],
  component: lazy(() => import('./length-converter')),
  i18n: {
    name: 'translation:lengthConverter.title',
    description: 'translation:lengthConverter.description',
    shortDescription: 'translation:lengthConverter.shortDescription',
    userTypes: ['generalUsers']
  }
});
