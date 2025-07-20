import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('number', {
  i18n: {
    name: 'number:randomNumberGenerator.title',
    description: 'number:randomNumberGenerator.description',
    shortDescription: 'number:randomNumberGenerator.shortDescription',
    longDescription: 'number:randomNumberGenerator.longDescription'
  },
  path: 'random-number-generator',
  icon: 'mdi:dice-multiple',
  keywords: [
    'random',
    'number',
    'generator',
    'range',
    'min',
    'max',
    'integer',
    'decimal',
    'float'
  ],
  component: lazy(() => import('./index'))
});
