import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: 'Wrap',
  path: 'wrap',
  icon: 'mdi:wrap',
  description:
    'A tool to wrap each item in a list with custom prefix and suffix characters. Useful for formatting lists for code, markup languages, or presentation.',
  shortDescription: 'Add characters around list items.',
  keywords: ['wrap'],
  component: lazy(() => import('./index'))
});
