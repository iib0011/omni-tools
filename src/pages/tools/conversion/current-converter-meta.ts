import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('conversion', {
  path: 'current-converter',
  icon: 'mdi:current-ac',
  keywords: ['current', 'ampere', 'milliampere', 'kiloampere', 'convert'],
  component: lazy(() => import('./current-converter')),
  i18n: {
    name: 'translation:currentConverter.title',
    description: 'translation:currentConverter.description',
    shortDescription: 'translation:currentConverter.shortDescription',
    userTypes: ['generalUsers']
  }
});
