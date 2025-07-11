import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('pdf', {
  name: 'PDF Editor',
  path: 'editor',
  icon: 'mdi:file-document-edit',
  description:
    'Advanced PDF editor with annotation, form-fill, highlight, and export capabilities. Edit your PDFs directly in the browser with professional-grade tools including text insertion, drawing, highlighting, signing and form filling.',
  shortDescription:
    'Edit PDFs with advanced annotation, signing and editing tools',
  keywords: [
    'pdf',
    'editor',
    'edit',
    'annotate',
    'highlight',
    'form',
    'fill',
    'text',
    'drawing',
    'signature',
    'export',
    'annotation',
    'markup'
  ],
  component: lazy(() => import('./index'))
});
