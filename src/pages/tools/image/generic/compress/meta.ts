import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  name: 'Compress Image',
  path: 'compress',
  icon: 'material-symbols-light:compress-rounded',
  description:
    'Reduce image file size while maintaining quality. Compress images for easier sharing, uploading, or storage.',
  shortDescription: 'Compress images to reduce file size',
  keywords: ['compress', 'image', 'reduce', 'size', 'optimize'],
  userTypes: ['General Users', 'Students', 'Developers'],
  component: lazy(() => import('./index'))
});
