import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('pdf', {
  path: 'compress-pdf',
  icon: 'material-symbols:compress',

  keywords: [
    'pdf',
    'compress',
    'reduce',
    'size',
    'optimize',
    'shrink',
    'file size',
    'ghostscript',
    'secure',
    'private',
    'browser',
    'webassembly'
  ],

  component: lazy(() => import('./index')),
  i18n: {
    name: 'pdf:compressPdf.title',
    description: 'pdf:compressPdf.description',
    shortDescription: 'pdf:compressPdf.shortDescription'
  }
});
