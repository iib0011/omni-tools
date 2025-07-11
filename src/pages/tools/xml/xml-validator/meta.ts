import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('xml', {
  name: 'XML Validator',
  path: 'xml-validator',
  icon: 'mdi:check-decagram',
  description:
    'Validate XML files or strings to ensure they are well-formed and error-free.',
  shortDescription: 'Validate XML for errors.',
  keywords: ['xml', 'validate', 'check', 'syntax', 'error'],
  component: lazy(() => import('./index'))
});
