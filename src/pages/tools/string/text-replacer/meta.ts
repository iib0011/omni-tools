import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  i18n: {
    name: 'string:textReplacer.title',
    description: 'string:textReplacer.description',
    shortDescription: 'string:textReplacer.shortDescription'
  },

  path: 'replacer',

  icon: 'material-symbols-light:find-replace',

  keywords: ['text', 'replace'],
  userTypes: ['General Users', 'Students', 'Developers'],
  component: lazy(() => import('./index'))
});
