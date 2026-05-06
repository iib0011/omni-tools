import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('number', {
  path: 'byte-converter',
  icon: 'fluent:calculator-arrow-clockwise-24-regular',

  keywords: ['byte', 'converter'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'number:byteConverter.title',
    description: 'number:byteConverter.description',
    shortDescription: 'number:byteConverter.shortDescription',
    userTypes: ['generalUsers', 'developers']
  }
});
