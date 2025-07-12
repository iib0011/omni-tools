import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const meta = defineTool('pdf', {
  name: 'Merge PDF',
  shortDescription: 'Merge multiple PDF files into a single document',
  description: 'Combine multiple PDF files into a single document.',
  icon: 'material-symbols-light:merge',
  component: lazy(() => import('./index')),
  keywords: ['pdf', 'merge', 'extract', 'pages', 'combine', 'document'],
  path: 'merge-pdf',
  userTypes: ['General Users', 'Students', 'Developers']
});
