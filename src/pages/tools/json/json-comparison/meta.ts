import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('json', {
  path: 'json-comparison',
  icon: 'fluent:branch-compare-24-regular',
  keywords: ['json', 'compare', 'diff', 'differences', 'match', 'validation'],
  component: lazy(() => import('./index')),

  i18n: {
    name: 'json:comparison.title',
    description: 'json:comparison.description',
    shortDescription: 'json:comparison.shortDescription'
  }
});
