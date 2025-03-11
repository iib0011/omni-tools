import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('png', {
  name: 'Crop',
  path: 'crop',
  icon: 'mdi:crop', // Iconify icon as a string
  description: 'A tool to crop images with precision and ease.',
  shortDescription: 'Crop images quickly.',
  keywords: ['crop', 'image', 'edit', 'resize', 'trim'],
  component: lazy(() => import('./index'))
});
