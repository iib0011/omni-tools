import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  name: 'Image Editor',
  path: 'editor',
  icon: 'mdi:image-edit',
  description:
    'Advanced image editor with tools for cropping, rotating, annotating, adjusting colors, and adding watermarks. Edit your images with professional-grade tools directly in your browser.',
  shortDescription: 'Edit images with advanced tools and features',
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
