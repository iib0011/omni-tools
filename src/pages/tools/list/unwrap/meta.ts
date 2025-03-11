import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: 'Unwrap',
  path: 'unwrap',
  icon: 'mdi:unwrap',
  description:
    'A tool to remove characters from the beginning and end of each item in a list. Perfect for cleaning up formatted data or removing unwanted wrappers.',
  shortDescription: 'Remove characters around list items.',
  keywords: ['unwrap'],
  component: lazy(() => import('./index'))
});
