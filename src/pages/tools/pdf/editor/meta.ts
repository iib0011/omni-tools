import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('pdf', {
  i18n: {
    name: 'pdf:editor.title',
    description: 'pdf:editor.description',
    shortDescription: 'pdf:editor.shortDescription'
  },

  path: 'editor',
  icon: 'mdi:file-document-edit',

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
  userTypes: ['General Users', 'Students', 'Developers'],
  component: lazy(() => import('./index'))
});
