import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('json', {
  name: 'Validate JSON',
  path: 'validateJson',
  icon: 'lets-icons:json-light',
  description:
    'Validate JSON data for syntax errors and structural correctness. This tool helps ensure your JSON is properly formatted and valid.',
  shortDescription: 'Validate JSON syntax and structure',
  keywords: ['validate', 'json', 'syntax', 'check', 'verify'],
  userTypes: ['Developers'],
  component: lazy(() => import('./index'))
});
