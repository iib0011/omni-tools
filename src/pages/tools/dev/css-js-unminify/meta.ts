import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('dev', {
  i18n: {
    name: 'dev:cssJsUnminify.title',
    description: 'dev:cssJsUnminify.description',
    shortDescription: 'dev:cssJsUnminify.shortDescription',
    longDescription: 'dev:cssJsUnminify.longDescription'
  },
  path: 'css-js-unminify',
  icon: 'material-symbols:code',
  keywords: ['css', 'js', 'unminify'],
  component: lazy(() => import('./index'))
});
