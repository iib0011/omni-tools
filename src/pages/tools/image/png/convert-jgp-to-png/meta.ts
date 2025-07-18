import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('png', {
  i18n: {
    name: 'image:convertJgpToPng.title',
    description: 'image:convertJgpToPng.description',
    shortDescription: 'image:convertJgpToPng.shortDescription'
  },

  path: 'convert-jgp-to-png',
  icon: 'ph:file-jpg-thin',

  keywords: ['convert', 'jgp', 'png'],
  component: lazy(() => import('./index'))
});
