import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: 'Rotate list',
  path: 'rotate',
  icon: 'material-symbols-light:rotate-right',
  description:
    'A tool to rotate items in a list by a specified number of positions. Shift elements left or right while maintaining their relative order.',
  shortDescription: 'Shift list items by position.',
  keywords: ['rotate'],
  userTypes: ['General Users', 'Students'],
  component: lazy(() => import('./index'))
});
