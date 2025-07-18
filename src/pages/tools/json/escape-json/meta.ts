import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('json', {
  path: 'escape-json',
  icon: 'material-symbols:code',

  keywords: ['json', 'escape', 'characters', 'format'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'json:escapeJson.title',
    description: 'json:escapeJson.description',
    shortDescription: 'json:escapeJson.shortDescription',
    userTypes: ['Developers']
  }
});
