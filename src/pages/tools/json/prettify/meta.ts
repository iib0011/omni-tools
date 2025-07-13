import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('json', {
  name: 'Prettify JSON',
  path: 'prettify',
  icon: 'material-symbols:code',
  description:
    'Format and beautify JSON data with proper indentation and spacing. Make JSON files more readable and organized.',
  shortDescription: 'Format and beautify JSON code',
  keywords: ['json', 'prettify', 'format', 'beautify'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'json:prettify.title',
    description: 'json:prettify.description',
    shortDescription: 'json:prettify.shortDescription'
  }
});
