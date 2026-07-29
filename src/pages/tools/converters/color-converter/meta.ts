import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('converters', {
  path: 'color-converter',
  icon: 'mdi:palette-outline',
  keywords: [
    'color',
    'colour',
    'hex',
    'rgb',
    'hsl',
    'hsv',
    'oklch',
    'converter',
    'picker',
    'wcag',
    'contrast',
    'palette',
    'css',
    'tailwind',
    'scss'
  ],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'converters:colorConverter.title',
    description: 'converters:colorConverter.description',
    shortDescription: 'converters:colorConverter.shortDescription',
    userTypes: ['generalUsers', 'developers']
  }
});
