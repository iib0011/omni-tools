import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('xml', {
  name: 'XML Viewer',
  path: 'xml-viewer',
  icon: 'mdi:eye-outline',
  description:
    'View and pretty-print XML files or strings for easier reading and debugging.',
  shortDescription: 'Pretty-print and view XML.',
  keywords: ['xml', 'viewer', 'pretty print', 'format', 'inspect'],
  component: lazy(() => import('./index'))
});
