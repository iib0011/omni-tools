import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('conversion', {
  path: 'energy-converter',
  icon: 'mdi:solar-power',
  keywords: ['energy', 'joule', 'calorie', 'kilowatt-hour', 'btu', 'convert'],
  component: lazy(() => import('./energy-converter')),
  i18n: {
    name: 'translation:energyConverter.title',
    description: 'translation:energyConverter.description',
    shortDescription: 'translation:energyConverter.shortDescription',
    userTypes: ['generalUsers']
  }
});
