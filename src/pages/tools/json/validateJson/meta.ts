import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('json', {
  path: 'validateJson',
  icon: 'material-symbols:check-circle',

  keywords: ['json', 'validate', 'check', 'syntax', 'errors'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'json:validateJson.title',
    description: 'json:validateJson.description',
    shortDescription: 'json:validateJson.shortDescription',
    userTypes: ['General Users', 'Students', 'Developers']
  }
});
