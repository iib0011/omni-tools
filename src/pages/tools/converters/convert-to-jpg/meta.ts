import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('converters', {
  i18n: {
    name: 'converters:convertToJPG.title',
    description: 'converters:convertToJPG.description',
    shortDescription: 'converters:convertToJPG.shortDescription'
  },

  path: 'convert-to-jpg',
  icon: 'ph:file-jpg-thin',

  keywords: ['convert', 'jpg', 'images', 'quality', 'compression'],
  component: lazy(() => import('./index'))
});
