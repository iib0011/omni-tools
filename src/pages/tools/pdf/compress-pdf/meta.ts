import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('pdf', {
  name: 'Compress PDF',
  path: 'compress-pdf',
  icon: 'material-symbols:compress',
  description:
    'Reduce PDF file size while maintaining quality using Ghostscript',
  shortDescription: 'Compress PDF files securely in your browser',
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
  longDescription:
    'Compress PDF files securely in your browser using Ghostscript. Your files never leave your device, ensuring complete privacy while reducing file sizes for email sharing, uploading to websites, or saving storage space. Powered by WebAssembly technology.',
  component: lazy(() => import('./index'))
});
