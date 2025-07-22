import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  path: 'base64',
  icon: 'tabler:number-64-small',

  keywords: ['base64'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:base64.title',
    description: 'string:base64.description',
    shortDescription: 'string:base64.shortDescription',
    userTypes: ['generalUsers', 'developers']
  }
});
