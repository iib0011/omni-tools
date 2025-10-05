import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('conversion', {
  path: 'digital-converter',
  icon: 'mdi:database',
  keywords: [
    'digital',
    'data',
    'bit',
    'byte',
    'kilobyte',
    'megabyte',
    'gigabyte',
    'convert'
  ],
  component: lazy(() => import('./digital-converter')),
  i18n: {
    name: 'translation:digitalConverter.title',
    description: 'translation:digitalConverter.description',
    shortDescription: 'translation:digitalConverter.shortDescription',
    userTypes: ['generalUsers']
  }
});
