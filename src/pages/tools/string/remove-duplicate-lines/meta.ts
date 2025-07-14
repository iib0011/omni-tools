import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  path: 'remove-duplicate-lines',
  icon: 'pepicons-print:duplicate-off',

  keywords: ['remove', 'duplicate', 'lines'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:removeDuplicateLines.title',
    description: 'string:removeDuplicateLines.description',
    shortDescription: 'string:removeDuplicateLines.shortDescription'
  }
});
