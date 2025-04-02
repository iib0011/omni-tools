import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  name: 'Change colors in image',
  path: 'change-colors',
  icon: 'cil:color-fill',
  description:
    "World's simplest online Image color changer. Just import your image (JPG, PNG, SVG) in the editor on the left, select which colors to change, and you'll instantly get a new image with the new colors on the right. Free, quick, and very powerful. Import an image – replace its colors.",
  shortDescription: 'Quickly swap colors in a image',
  keywords: ['change', 'colors', 'in', 'png', 'image', 'jpg'],
  component: lazy(() => import('./index'))
});
