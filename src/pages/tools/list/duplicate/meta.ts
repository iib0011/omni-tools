import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: 'Duplicate',
  path: 'duplicate',
  icon: 'mdi:content-duplicate',
  description:
    'A tool to duplicate each item in a list a specified number of times. Perfect for creating repeated patterns, test data, or expanding datasets.',
  shortDescription: 'Repeat items in a list multiple times.',
  keywords: ['duplicate'],
  component: lazy(() => import('./index'))
});
