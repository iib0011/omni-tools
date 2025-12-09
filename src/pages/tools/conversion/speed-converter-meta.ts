import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('conversion', {
  path: 'speed-converter',
  icon: 'mdi:speedometer',
  keywords: ['speed', 'km/h', 'm/s', 'mph', 'knots', 'convert'],
  component: lazy(() => import('./speed-converter')),
  i18n: {
    name: 'translation:speedConverter.title',
    description: 'translation:speedConverter.description',
    shortDescription: 'translation:speedConverter.shortDescription',
    userTypes: ['generalUsers']
  }
});
