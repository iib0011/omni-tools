import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  path: 'to-morse',
  icon: 'arcticons:morse',
  keywords: [],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:toMorse.title',
    description: 'string:toMorse.description',
    shortDescription: 'string:toMorse.shortDescription',
    userTypes: ['generalUsers', 'developers']
  }
});
