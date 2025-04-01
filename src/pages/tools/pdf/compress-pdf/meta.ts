import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('pdf', {
  name: 'Compress PDF',
  path: 'compress-pdf',
  icon: 'material-symbols:compress',
  description: 'Reduce PDF file size while maintaining quality',
  shortDescription: 'Compress PDF files to reduce size',
  keywords: [
    'pdf',
    'compress',
    'reduce',
    'size',
    'optimize',
    'shrink',
    'file size'
  ],
  longDescription:
    'Compress PDF files to reduce their size while maintaining reasonable quality. Useful for sharing documents via email, uploading to websites, or saving storage space.',
  component: lazy(() => import('./index'))
});
