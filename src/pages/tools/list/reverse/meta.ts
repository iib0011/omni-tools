import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: 'Reverse',
  path: 'reverse',
  icon: 'proicons:reverse',
  description:
    'This is a super simple browser-based application prints all list items in reverse. The input items can be separated by any symbol and you can also change the separator of the reversed list items.',
  shortDescription: 'Quickly reverse a list',
  keywords: ['reverse'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'list:reverse.title',
    description: 'list:reverse.description',
    shortDescription: 'list:reverse.shortDescription'
  }
});
