import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('json', {
  name: 'Compare JSON',
  path: 'json-comparison',
  icon: 'fluent:branch-compare-24-regular',
  description:
    'Compare two JSON objects to identify differences in structure and values.',
  shortDescription: 'Find differences between two JSON objects',
  keywords: ['json', 'compare', 'diff', 'differences', 'match', 'validation'],
  component: lazy(() => import('./index'))
});
