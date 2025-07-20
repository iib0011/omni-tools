import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('dev', {
  i18n: {
    name: 'dev:cssJsMinify.title',
    description: 'dev:cssJsMinify.description',
    shortDescription: 'dev:cssJsMinify.shortDescription',
    longDescription: 'dev:cssJsMinify.longDescription'
  },
  path: 'css-js-minify',
  icon: 'material-symbols:code',
  keywords: ['css', 'js', 'minify'],
  component: lazy(() => import('./index'))
});
