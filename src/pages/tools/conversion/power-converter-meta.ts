import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('conversion', {
  path: 'power-converter',
  icon: 'mdi:power-plug',
  keywords: ['power', 'watt', 'kilowatt', 'megawatt', 'horsepower', 'convert'],
  component: lazy(() => import('./power-converter')),
  i18n: {
    name: 'translation:powerConverter.title',
    description: 'translation:powerConverter.description',
    shortDescription: 'translation:powerConverter.shortDescription',
    userTypes: ['generalUsers']
  }
});
