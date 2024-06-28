import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('png', {
  name: 'Convert jgp to png',
  path: 'convert-jgp-to-png',
  // image,
  description:
    'Quickly your JPG images to PNG. Just import your PNG image in the editor on the left',
  shortDescription: '',
  keywords: ['convert', 'jgp', 'to', 'png'],
  component: lazy(() => import('./index'))
});
