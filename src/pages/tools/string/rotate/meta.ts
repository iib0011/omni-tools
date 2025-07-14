import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  i18n: {
    name: 'string:rotate.title',
    description: 'string:rotate.description',
    shortDescription: 'string:rotate.shortDescription'
  },
  name: 'Rotate',
  path: 'rotate',
  icon: 'carbon:rotate',
  description:
    'A tool to rotate characters in a string by a specified number of positions. Shift characters left or right while maintaining their relative order.',
  shortDescription: 'Shift characters in text by position.',
  keywords: ['rotate'],
  component: lazy(() => import('./index'))
});
