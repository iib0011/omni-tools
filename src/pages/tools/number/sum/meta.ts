import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('number', {
  name: 'Sum',
  path: 'sum',
  icon: 'material-symbols:add',
  description:
    'Calculate the sum of a list of numbers. Enter numbers separated by commas or newlines to get their total sum.',
  shortDescription: 'Calculate sum of numbers',
  keywords: ['sum', 'add', 'calculate', 'total'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'number.sum.name',
    description: 'number.sum.description',
    shortDescription: 'number.sum.shortDescription'
  }
});
