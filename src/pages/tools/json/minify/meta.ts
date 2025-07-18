import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('json', {
  path: 'minify',
  icon: 'material-symbols:code',

  keywords: ['json', 'minify', 'compress', 'whitespace'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'json:minify.title',
    description: 'json:minify.description',
    shortDescription: 'json:minify.shortDescription',
    userTypes: ['Developers']
  }
});
