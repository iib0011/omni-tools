import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('number', {
  path: 'generate',
  icon: 'material-symbols:add-circle',

  keywords: ['generate', 'random', 'numbers'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'number:generate.title',
    description: 'number:generate.description',
    shortDescription: 'number:generate.shortDescription'
  }
});
