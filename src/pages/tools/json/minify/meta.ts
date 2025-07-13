import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('json', {
  name: 'Minify JSON',
  path: 'minify',
  icon: 'material-symbols:code',
  description:
    'Minify JSON data by removing unnecessary whitespace and formatting. Reduce file size while maintaining data integrity.',
  shortDescription: 'Minify JSON by removing whitespace',
  keywords: ['json', 'minify', 'compress', 'whitespace'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'json.minify.name',
    description: 'json.minify.description',
    shortDescription: 'json.minify.shortDescription'
  }
});
