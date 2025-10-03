import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('conversion', {
  path: 'voltage-converter',
  icon: 'mdi:flash',
  keywords: ['voltage', 'volt', 'millivolt', 'kilovolt', 'convert'],
  component: lazy(() => import('./voltage-converter')),
  i18n: {
    name: 'translation:voltageConverter.title',
    description: 'translation:voltageConverter.description',
    shortDescription: 'translation:voltageConverter.shortDescription',
    userTypes: ['generalUsers']
  }
});
