import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('json', {
  path: 'prettify',
  icon: 'material-symbols:code',

  keywords: ['json', 'prettify', 'format', 'beautify'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'json:prettify.title',
    description: 'json:prettify.description',
    shortDescription: 'json:prettify.shortDescription'
  }
});
