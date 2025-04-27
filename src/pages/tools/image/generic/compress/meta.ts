import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  name: 'Compress Image',
  path: 'compress',
  component: lazy(() => import('./index')),
  icon: 'material-symbols-light:compress-rounded',
  description:
    'Compress images to reduce file size while maintaining reasonable quality.',
  shortDescription:
    'Compress images to reduce file size while maintaining reasonable quality.',
  keywords: ['image', 'compress', 'reduce', 'quality']
});
