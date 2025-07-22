import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('number', {
  path: 'sum',
  icon: 'material-symbols:add',

  keywords: ['sum', 'add', 'calculate', 'total'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'number:sum.title',
    description: 'number:sum.description',
    shortDescription: 'number:sum.shortDescription',
    userTypes: ['General Users']
  }
});
