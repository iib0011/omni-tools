import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  path: 'loop',
  icon: 'material-symbols:loop',

  keywords: ['video', 'loop', 'repeat', 'continuous'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'video:loop.title',
    description: 'video:loop.description',
    shortDescription: 'video:loop.shortDescription',
    userTypes: ['General Users', 'Students', 'Developers']
  }
});
