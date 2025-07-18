import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('xml', {
  path: 'xml-validator',
  icon: 'material-symbols:check-circle',
  keywords: ['xml', 'validate', 'check', 'syntax', 'errors'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'xml:xmlValidator.title',
    description: 'xml:xmlValidator.description',
    shortDescription: 'xml:xmlValidator.shortDescription'
  }
});
