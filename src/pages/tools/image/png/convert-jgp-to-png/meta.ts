import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('png', {
  i18n: {
    name: 'image:convertJgpToPng.title',
    description: 'image:convertJgpToPng.description',
    shortDescription: 'image:convertJgpToPng.shortDescription'
  },
  name: 'Convert JPG to PNG',
  path: 'convert-jgp-to-png',
  icon: 'ph:file-jpg-thin',
  description:
    'Quickly convert your JPG images to PNG. Just import your PNG image in the editor on the left',
  shortDescription: 'Quickly convert your JPG images to PNG',
  keywords: ['convert', 'jgp', 'png'],
  component: lazy(() => import('./index'))
});
