import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('png', {
  name: 'Change PNG Opacity',
  path: 'change-opacity',
  icon: 'material-symbols:opacity',
  description: 'Easily adjust the transparency of your PNG images. Simply upload your PNG file, use the slider to set the desired opacity level between 0 (fully transparent) and 1 (fully opaque), and download the modified image.',
  shortDescription: 'Adjust transparency of PNG images',
  keywords: ['opacity', 'transparency', 'png', 'alpha'],
  component: lazy(() => import('./index'))
});
