import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('pdf', {
  i18n: {
    name: 'pdf:formBuilder.title',
    description: 'pdf:formBuilder.description',
    shortDescription: 'pdf:formBuilder.shortDescription',
    userTypes: ['generalUsers']
  },

  path: 'form-pdf',
  icon: 'material-symbols-light:checklist',

  keywords: [
    'pdf',
    'editor',
    'edit',
    'annotate',
    'highlight',
    'form',
    'fill',
    'text',
    'export'
  ],
  component: lazy(() => import('./index'))
});
