import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: 'Reverse list',
  path: 'reverse',
  icon: 'proicons:reverse',
  description:
    'This is a super simple browser-based application prints all list items in reverse. The input items can be separated by any symbol and you can also change the separator of the reversed list items.',
  shortDescription: 'Quickly reverse a list',
  keywords: ['reverse'],
  userTypes: ['General Users', 'Students'],
  component: lazy(() => import('./index'))
});
