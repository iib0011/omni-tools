import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('conversion', {
  path: 'mass-converter',
  icon: 'mdi:weight',
  keywords: ['mass', 'weight', 'convert', 'gram', 'kilogram', 'pound', 'ounce'],
  component: lazy(() => import('./mass-converter')),
  i18n: {
    name: 'translation:massConverter.title',
    description: 'translation:massConverter.description',
    shortDescription: 'translation:massConverter.shortDescription',
    userTypes: ['generalUsers']
  }
});
