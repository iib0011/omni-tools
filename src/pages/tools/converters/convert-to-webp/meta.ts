import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('converters', {
  i18n: {
    name: 'converters:convertToWebp.title',
    description: 'converters:convertToWebp.description',
    shortDescription: 'converters:convertToWebp.shortDescription'
  },

  path: 'convert-to-webp',
  icon: 'iconoir:webp-format',

  keywords: ['convert', 'jpg', 'jpeg', 'png', 'webp', 'compression'],
  component: lazy(() => import('./index'))
});
