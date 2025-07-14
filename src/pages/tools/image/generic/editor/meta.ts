import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  i18n: {
    name: 'image:editor.title',
    description: 'image:editor.description',
    shortDescription: 'image:editor.shortDescription'
  },

  path: 'editor',
  icon: 'mdi:image-edit',

  keywords: [
    'image',
    'editor',
    'edit',
    'crop',
    'rotate',
    'annotate',
    'adjust',
    'watermark',
    'text',
    'drawing',
    'filters',
    'brightness',
    'contrast',
    'saturation'
  ],
  component: lazy(() => import('./index'))
});
