import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('conversion', {
  path: 'area-converter',
  icon: 'mdi:ruler-square',
  keywords: ['area', 'convert', 'square meter', 'acre', 'hectare'],
  component: lazy(() => import('./area-converter')),
  i18n: {
    name: 'translation:areaConverter.title',
    description: 'translation:areaConverter.description',
    shortDescription: 'translation:areaConverter.shortDescription',
    userTypes: ['generalUsers']
  }
});
