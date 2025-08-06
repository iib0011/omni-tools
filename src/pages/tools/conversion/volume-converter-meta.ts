import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('conversion', {
  path: 'volume-converter',
  icon: 'mdi:cup-water',
  keywords: ['volume', 'capacity', 'convert', 'liter', 'gallon', 'pint', 'cup'],
  component: lazy(() => import('./volume-converter')),
  i18n: {
    name: 'translation:volumeConverter.title',
    description: 'translation:volumeConverter.description',
    shortDescription: 'translation:volumeConverter.shortDescription',
    userTypes: ['generalUsers']
  }
});
