import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import image from '@assets/image.png';

export const tool = defineTool('png', {
  name: 'Convert JPG to PNG',
  path: 'convert-jgp-to-png',
  image,
  description:
    'Quickly convert your JPG images to PNG. Just import your PNG image in the editor on the left',
  shortDescription: 'Quickly convert your JPG images to PNG',
  keywords: ['convert', 'jgp', 'png'],
  component: lazy(() => import('./index'))
});
