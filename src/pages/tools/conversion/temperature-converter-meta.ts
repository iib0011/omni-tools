import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('conversion', {
  path: 'temperature-converter',
  icon: 'mdi:thermometer',
  keywords: [
    'temperature',
    'celsius',
    'fahrenheit',
    'kelvin',
    'rankine',
    'convert'
  ],
  component: lazy(() => import('./temperature-converter')),
  i18n: {
    name: 'translation:temperatureConverter.title',
    description: 'translation:temperatureConverter.description',
    shortDescription: 'translation:temperatureConverter.shortDescription',
    userTypes: ['generalUsers']
  }
});
