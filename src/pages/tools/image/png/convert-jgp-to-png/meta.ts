import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('png', {
  name: 'Convert JPG to PNG',
  path: 'convert-jgp-to-png',
  icon: 'ph:file-jpg-thin',
  description:
    'Quickly convert your JPG images to PNG. Just import your PNG image in the editor on the left',
  shortDescription: 'Quickly convert your JPG images to PNG',
  keywords: ['convert', 'jgp', 'png'],
  component: lazy(() => import('./index'))
});
