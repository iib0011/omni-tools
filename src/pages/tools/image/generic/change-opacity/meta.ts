import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  name: 'Change image Opacity',
  path: 'change-opacity',
  icon: 'material-symbols:opacity',
  description:
    'Easily adjust the transparency of your images. Simply upload your image, use the slider to set the desired opacity level between 0 (fully transparent) and 1 (fully opaque), and download the modified image.',
  shortDescription: 'Adjust transparency of images',
  keywords: ['opacity', 'transparency', 'png', 'alpha', 'jpg', 'jpeg', 'image'],
  component: lazy(() => import('./index'))
});
