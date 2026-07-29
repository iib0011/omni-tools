import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('converters', {
  path: 'unit-converter',
  icon: 'mdi:ruler-square',
  keywords: [
    'unit',
    'converter',
    'length',
    'weight',
    'temperature',
    'speed',
    'area',
    'volume',
    'metric',
    'imperial'
  ],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'converters:unitConverter.title',
    description: 'converters:unitConverter.description',
    shortDescription: 'converters:unitConverter.shortDescription',
    userTypes: ['generalUsers']
  }
});
