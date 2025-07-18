import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  path: 'rotate',
  icon: 'material-symbols:rotate-right',

  keywords: ['video', 'rotate', 'orientation', 'degrees'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'video:rotate.title',
    description: 'video:rotate.description',
    shortDescription: 'video:rotate.shortDescription',
    userTypes: ['General Users', 'Students', 'Developers']
  }
});
