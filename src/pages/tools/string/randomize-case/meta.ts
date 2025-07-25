import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  path: 'randomize-case',
  icon: 'material-symbols-light:shuffle',

  keywords: ['randomize', 'case'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:randomizeCase.title',
    description: 'string:randomizeCase.description',
    shortDescription: 'string:randomizeCase.shortDescription',
    userTypes: ['generalUsers']
  }
});
