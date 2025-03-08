import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('number', {
  name: 'Generate Arithmetic Sequence',
  path: 'arithmetic-sequence',
  icon: 'ic:sharp-plus',
  description:
    'Generate an arithmetic sequence by specifying the first term (a₁), common difference (d), and number of terms (n). The tool creates a sequence where each number differs from the previous by a constant difference.',
  shortDescription:
    'Generate a sequence where each term differs by a constant value.',
  keywords: [
    'arithmetic',
    'sequence',
    'progression',
    'numbers',
    'series',
    'generate'
  ],
  component: lazy(() => import('./index'))
});
