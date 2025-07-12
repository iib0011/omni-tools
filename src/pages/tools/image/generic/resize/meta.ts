import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  name: 'Resize Image',
  path: 'resize',
  icon: 'mdi:resize',
  description:
    'Resize images to different dimensions while maintaining aspect ratio or custom sizes.',
  shortDescription: 'Resize images to different dimensions',
  keywords: ['resize', 'image', 'dimensions', 'scale', 'aspect ratio'],
  userTypes: ['General Users', 'Students', 'Developers'],
  component: lazy(() => import('./index'))
});
