import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('json', {
  name: 'Validate JSON',
  path: 'validate-json',
  icon: 'material-symbols:check-circle',
  description:
    'Validate JSON code for syntax errors and proper structure. Check if JSON documents follow correct formatting rules.',
  shortDescription: 'Validate JSON code for errors',
  keywords: ['json', 'validate', 'check', 'syntax', 'errors'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'json.validateJson.name',
    description: 'json.validateJson.description',
    shortDescription: 'json.validateJson.shortDescription'
  }
});
