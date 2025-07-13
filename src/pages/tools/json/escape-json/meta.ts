import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('json', {
  name: 'Escape JSON',
  path: 'escape-json',
  icon: 'material-symbols:code',
  description:
    'Escape special characters in JSON strings. Convert JSON data to properly escaped format for safe transmission or storage.',
  shortDescription: 'Escape special characters in JSON',
  keywords: ['json', 'escape', 'characters', 'format'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'json.escapeJson.name',
    description: 'json.escapeJson.description',
    shortDescription: 'json.escapeJson.shortDescription'
  }
});
