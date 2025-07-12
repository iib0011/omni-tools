import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('pdf', {
  name: 'PDF to PNG',
  path: 'pdf-to-png',
  icon: 'mdi:image-multiple', // Iconify icon ID
  description: 'Transform PDF documents into PNG panels.',
  shortDescription: 'Convert PDF into PNG images',
  keywords: ['pdf', 'png', 'convert', 'image', 'extract', 'pages'],
  longDescription:
    'Upload a PDF and convert each page into a high-quality PNG image directly in your browser. This tool is ideal for extracting visual content or sharing individual pages. No data is uploaded — everything runs locally.',
  userTypes: ['General Users', 'Students', 'Developers'],
  component: lazy(() => import('./index'))
});
